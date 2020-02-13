import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TouchableWithoutFeedback,
  ActivityIndicator,
  UIManager,
  Alert,
  Modal,
  Linking,
  TextInput
} from 'react-native';

import { Icon, Header, Button, CheckBox, Input } from 'react-native-elements';
import ActionSheet from 'react-native-actionsheet';
import { colors } from '../common/theme';
import { ChangePasswordModal } from '../components';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo';
import Constants from 'expo-constants';
var { width, height } = Dimensions.get('window');
import * as firebase from 'firebase';
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";
import { PromoComp } from "../components";
import  languageJSON  from '../common/language';
import { Currency } from '../common/CurrencySymbol';

export default class CardDetailsScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loadingModal: false,
      pinModalVisible: false,
      billingModalVisible: false,
      dropdown: true,
      sdropdown: true,
      savedCardchecked: false,
      savedCards: [],
      cvvModal: false,
      cvvofSaveCard:"",
      selectedSaveCardDetails:'',
      cardData:'',
      otpModal:false,
      useWalletCash:false,
      walletBalance:0,
      promodalVisible:false
    }
    console.log(Constants.installationId)

  }

  async componentWillMount() {
    var pdata = this.props.navigation.getParam('data');
    if (pdata) {
      data = {
        userUId: firebase.auth().currentUser,
        amount: pdata.trip_cost,
        discount:0,
        payableAmmount:pdata.trip_cost,
        email: pdata.email,
        phonenumber: pdata.phonenumber,
        firstname: pdata.firstname,
        lastname: pdata.lastname,
        txRef: pdata.bookingKey // booking id
      }
      this.setState({
        userData: pdata,
        payDetails: data,
      })
    } else {
      console.log('PDATA not found')
    }
    this.loadWalletCash()
   
  }

  loadWalletCash(){
    const uRoot = firebase.database().ref('users/' + firebase.auth().currentUser.uid );
    uRoot.on('value', uval => {
      if(uval.val()){
        let data = uval.val()
        if(data.walletBalance && data.walletBalance>0){
            this.setState({walletBalance:data.walletBalance})
        }
      }
    })
  }


 componentDidMount(){
  this.loadSavedCards()
  }
  onCardChange = cardData => {
    console.log(JSON.stringify(cardData, null, ' '))
    this.setState({ cardData });
  };

  
  useWallet(){
    this.setState({ useWalletCash: !this.state.useWalletCash },()=>{
      if(this.state.useWalletCash == true){
        if(this.state.walletBalance >= this.state.payDetails.payableAmmount){
          this.setState({
            usedWalletAmmount :this.state.payDetails.payableAmmount
          })
        }else{
          let data = this.state.payDetails
          data.payableAmmount = data.payableAmmount - this.state.walletBalance;
         this.setState({usedWalletAmmount : this.state.walletBalance,payDetails:data})
        }
     }else{
      let data = this.state.payDetails;
      data.payableAmmount = data.amount - data.discount;
      this.setState({usedWalletAmmount :0,payDetails:data})
     }
    })
    
  }

  cashPayment() {
    this.setState({ loadingModal: true });
    this.setValueToDB('Cash')
  }

  walletPayment(){
    this.setState({ loadingModal: true });
    this.setValueToDB('Wallet') 
  }
  cardPayment(){
    
    if(this.state.payDetails && this.state.cardData){
    
      if(this.state.payDetails.payableAmmount > 0 && this.state.cardData.valid){
              this.saveCardsdb()
              let cardData = this.state.cardData.values;
              console.log('cardData',cardData);
              console.log('payable ',this.state.payDetails.payableAmmount);
              this.setState({ loadingModal: true });


              //PAYMENT GATEWAY LOGIC TO BE IMPLEMENTED HERE

              this.setValueToDB('Card') // TO BE CALLED ON VALID PAYMENT 
            }else{
              this.state.payDetails.payableAmmount <0 ? alert(languageJSON.payment_amound_error):alert(languageJSON.invalid_card_details_error)
            }
          }else{ 
            this.setState({loadingModal:false});
            setTimeout(()=>{
              alert(languageJSON.card_payment_blank_error);
            },1000)
          }
  }


  

  setValueToDB(paymentMode) {
    if (paymentMode) {
      let paramData = this.state.userData;
      firebase.database().ref('users/' + paramData.driver + '/my_bookings/' + paramData.bookingKey + '/').update({
        payment_status: "PAID",
        payment_mode: paymentMode,
        trip_cost:this.state.payDetails.amount - this.state.payDetails.discount,
        discount_amount:this.state.payDetails.discount
      }).then(() => {
        firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/my-booking/' + paramData.bookingKey + '/').update({
          payment_status: "PAID",
          payment_mode: paymentMode,
          trip_cost:this.state.payDetails.amount - this.state.payDetails.discount,
          discount_amount:this.state.payDetails.discount
        }).then(() => {
          firebase.database().ref('bookings/' + paramData.bookingKey + '/').update({
            payment_status: "PAID",
            payment_mode: paymentMode,
            trip_cost:this.state.payDetails.amount - this.state.payDetails.discount,
            discount_amount:this.state.payDetails.discount
          }).then(() => {
            this.setState({ loadingModal: false });
          
                if(this.state.usedWalletAmmount){
                 if(this.state.usedWalletAmmount > 0){
                  let tDate = new Date();
                    firebase.database().ref('users/' + firebase.auth().currentUser.uid +'/walletHistory').push({
                      type:'Credit',
                      amount:this.state.usedWalletAmmount,
                      date:tDate.toString(),
                      txRef:this.state.payDetails.txRef,
                      }).then(()=>{
                        firebase.database().ref('users/' + firebase.auth().currentUser.uid +'/').update({
                          walletBalance:this.state.walletBalance-this.state.usedWalletAmmount
                        })
                      })
                  }
                }
            })
            setTimeout(() => {
              alert(languageJSON.success_payment);
            }, 1000)
            this.props.navigation.navigate('ratingPage', { data: paramData });
          })
        
      })
    }

  }

  loadSavedCards() {
    const sCardRoot = firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/saveCards/');
    sCardRoot.on('value', cards => {
      if (cards.val()) {
        let allCards = cards.val();
        var Cards = [];
        for (k in allCards) {
          allCards[k].key = k;
          allCards[k].selected = false;
            Cards.push(allCards[k])
            this.setState({savedCards: Cards })
        }
      }
    })
  }

  saveCardsdb() {
    if (this.state.savedCardchecked == true && this.state.cardData) {
      let carddetails = this.state.cardData;
       //carddetails.values.cvc =  '';
      firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/saveCards/').push(carddetails).then((res) => {
        if(res){
          let path = res.toString();
          var keyn = path.split('/')[6];
          firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/saveCards/'+keyn+'/values/').update({cvc:""})
          this.setState({ savedCardchecked: false })
        }
        
        
      })
    }
  }

  deleteSaveCard(indexkey) {
    if (indexkey) {

      Alert.alert(
        languageJSON.confrimation, 
        languageJSON.payment_alert,
        [
          {
            text: languageJSON.cancel,
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: languageJSON.yes, onPress: () => {
              firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/saveCards/' + indexkey).remove();
              this.setState({savedCards: []},()=>{
                 this.loadSavedCards()
              })
            }
          },
        ],
        { cancelable: false },
      );
    }
  }

 
  

 
  loading() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.loadingModal}
        onRequestClose={() => {
          this.setState({ loadingModal: false })
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(22,22,22,0.8)", justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: "#DBD7D9", borderRadius: 10, flex: 1, maxHeight: 70 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', flex: 1, justifyContent: "center" }}>
              <Image
                style={{ width: 80, height: 80, backgroundColor: colors.TRANSPARENT }}
                source={require('../../assets/images/loader.gif')}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#000", fontSize: 16, }}>{languageJSON.please_wait}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  saveCardPaymentSelect(index) {
    var allCards = this.state.savedCards;
    for (var i = 0; i < allCards.length; i++){
      allCards[i].selected = false;
      if (i == index) {
        allCards[i].selected = true;
        this.setState({selectedSaveCardDetails:allCards[i]})
      }
      if (i == allCards.length - 1) {
        this.setState(
          { 
            savedCards: allCards,
            cvvModal:true, // open CVV modal
            cvvofSaveCard:""
          }
        );

      }
    }
  }

  enterCVV() {
    return (
      <Modal
        visible={this.state.cvvModal}
        animationType={"slide"}
        transparent={true}
        onRequestClose={this.state.cvvModal == false}
      >
        <View style={styles.containercvv}>
          <View style={styles.modalContainercvv}>
            <View style={styles.blankViewStylecvv}>
              <Icon
                name="close"
                type="fontawesome"
                color={colors.BLACK}
                onPress={() =>this.requestmodalclose()}
                size={30}
              />
            </View>
            <View style={styles.modalContainerViewStylecvv}>
            <Text style={{marginBottom:8,fontSize:16}}>{languageJSON.enterCVV}</Text>
              <TextInput
                style={styles.inputcvv}
                underlineColorAndroid="transparent"
                placeholder="123"
                onChangeText={(text) => this.setState({ cvvofSaveCard: text })} value={this.state.cvvofSaveCard}
                maxLength={3}
              />
              <Button
                title="Submit"
                onPress={() => this.paywithSaveCard()}
              />
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  paywithSaveCard(){
    if(this.state.cvvofSaveCard == undefined || this.state.cvvofSaveCard == '' || this.state.cvvofSaveCard.length < 3){
      alert('Please enter cvv properly')
    }else{
      let selectedSaveCard = this.state.selectedSaveCardDetails;
      selectedSaveCard.values.cvc = this.state.cvvofSaveCard;
      this.setState({cardData:selectedSaveCard},()=>{
        this.setState({selectedSaveCardDetails:'',cvvModal:false})
        this.cardPayment()
      })
       
    }
  }

  requestmodalclose(){
    this.setState({
      cvvModal:false,
      otpModal:false,
      pinModalVisible:false
    })

  }
  

  dropDown(param) {
    
    if (param == 'up') {
      this.setState({
        dropdown: false,
        selectedSaveCardDetails:'',
        cardData:'',
        cvvofSaveCard:""
      })
    } else {
      this.setState({
        dropdown: true,
        selectedSaveCardDetails:'',
        cardData:'',
        cvvofSaveCard:""
      })
    }
  }
  saveCarddropDown(param) {

    if (param == 'up') {
      this.setState({
        sdropdown: false,
        selectedSaveCardDetails:'',
        cardData:'',
        cvvofSaveCard:""
      })
    } else {
      this.setState({
        sdropdown: true,
        selectedSaveCardDetails:'',
        cardData:'',
        cvvofSaveCard:""
      })
    }
  }






  promoModal() {

    return (
        <Modal
            animationType="none"
            // transparent={true}
            visible={this.state.promodalVisible}
            onRequestClose={() => {
                this.setState({ promodalVisible: false })
            }}>
            <Header
                backgroundColor={colors.GREY.default}
                rightComponent={{ icon: 'ios-close', type: 'ionicon', color: colors.WHITE, size: 45, component: TouchableWithoutFeedback, onPress: () => { this.setState({ promodalVisible: false }) } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{languageJSON.your_promo}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <PromoComp onPressButton={(item, index) => { this.SelectCopupon(item, index) }}></PromoComp>
        </Modal>
    )
}


SelectCopupon(item, index) {

        var toDay = new Date();
        var promoValidity = item.promo_validity
        var expiryDay = promoValidity.split('/')[0];
        var em = promoValidity.split('/')[1];
        var expiryMonth = em == 12 ? em - 1 : em
        var expiryYear = promoValidity.split('/')[2];
        var fexpDate = expiryMonth + '/' + expiryDay + '/' + expiryYear
        var expDate = new Date(fexpDate)
        if (this.state.payDetails.amount >= item.min_order) {
            var userAvail = item.user_avail
      
            // Checking is promo useby anyone
          if (userAvail != undefined) {

              if (toDay > expDate && userAvail.count == item.promo_usage_limit) {
                  alert(languageJSON.promo_exp)
              } else if (userAvail.count == item.promo_usage_limit) {
                  alert(languageJSON.promo_limit)
              } else {
                        let discounttype = item.promo_discount_type.toUpperCase();
                        //percentage discount block
                        if (discounttype == 'PERCENTAGE') {
                            let discount = this.state.payDetails.amount * item.promo_discount_value / 100; // discount Calculations
                            if (discount > item.max_promo_discount_value) {
                                let discount = item.max_promo_discount_value; // discount assign if discount greater than maximum discount
                               
                                let data = this.state.payDetails
                                data.discount = discount
                                data.promo_applied = true
                                data.promo_details = { promo_key: item.promoKey, promo_name: item.promo_name, discount_type: item.promo_discount_type, promo_discount_value: item.promo_discount_value, max_discount: item.max_promo_discount_value, minimumorder: item.min_order },
                                data.payableAmmount = data.amount - discount
                                this.setState({
                                  payDetails:data
                                }, () => {
                                    this.setState({ promodalVisible: false, modalVisible: false, alertModalVisible: false })
                                })
                                //alert(estimatefare)
                            } else {
                                // Estimate fare calculation with percentage discount
                                let data = this.state.payDetails
                                data.discount = discount
                                data.promo_applied = true
                                data.promo_details = { promo_key: item.promoKey, promo_name: item.promo_name, discount_type: item.promo_discount_type, promo_discount_value: item.promo_discount_value, max_discount: item.max_promo_discount_value, minimumorder: item.min_order },
                                data.payableAmmount = data.amount - discount
                                this.setState({
                                  payDetails:data
                                }, () => {
                                    this.setState({ promodalVisible: false, modalVisible: false, alertModalVisible: false })
                                })
                            }

                            // Flat discount block 
                        } else {
                            let discount = item.max_promo_discount_value;
                            //let estimatefare = this.state.estimateFare - discount; // Estimate fare calculation with flat discount
                            let data = this.state.payDetails
                                data.discount = discount
                                data.promo_applied = true
                                data.promo_details = { promo_key: item.promoKey, promo_name: item.promo_name, discount_type: item.promo_discount_type, promo_discount_value: item.promo_discount_value, max_discount: item.max_promo_discount_value, minimumorder: item.min_order },
                                data.payableAmmount = data.amount - discount
                                this.setState({
                                  payDetails:data
                                }, () => {
                                    this.setState({ promodalVisible: false, modalVisible: false, alertModalVisible: false })
                                })
                        }
                    }
                } else {
                    // if promo is not useby anyone.
                    if (toDay > fexpDate) {
                      alert(languageJSON.promo_exp)
                    } else {
                        let discounttype = item.promo_discount_type.toUpperCase();
                        if (discounttype == 'PERCENTAGE') {
                           var discount = this.state.payDetails.amount * item.promo_discount_value / 100; // discount Calculations 
                            if (discount > item.max_promo_discount_value) {
                                let discount = item.max_promo_discount_value; // discount assign if discount greater than maximum discount
                                //let estimatefare = this.state.estimateFare - discount; // Estimate fare calculations with percentage discount
                                let data = this.state.payDetails
                                data.discount = discount
                                data.promo_applied = true
                                data.promo_details = { promo_key: item.promoKey, promo_name: item.promo_name, discount_type: item.promo_discount_type, promo_discount_value: item.promo_discount_value, max_discount: item.max_promo_discount_value, minimumorder: item.min_order },
                                data.payableAmmount = data.amount - discount
                                this.setState({
                                  payDetails:data
                                }, () => {
                                    this.setState({ promodalVisible: false, modalVisible: false, alertModalVisible: false })
                                })
                            } else {
                                //let estimatefare = this.state.estimateFare - discount; // Estimate fare calculation with percentage discount
                                let data = this.state.payDetails
                                data.discount = discount
                                data.promo_applied = true
                                data.promo_details = { promo_key: item.promoKey, promo_name: item.promo_name, discount_type: item.promo_discount_type, promo_discount_value: item.promo_discount_value, max_discount: item.max_promo_discount_value, minimumorder: item.min_order },
                                data.payableAmmount = data.amount - discount
                                this.setState({
                                  payDetails:data
                                }, () => {
                                    this.setState({ promodalVisible: false, modalVisible: false, alertModalVisible: false })
                                })
                            }
                        } else {
                            let discount = item.max_promo_discount_value;
                            //let estimatefare = this.state.estimateFare - discount; // Estimate fare calculation with flat discount
                            let data = this.state.payDetails
                            data.discount = discount
                            data.promo_applied = true
                            data.promo_details = { promo_key: item.promoKey, promo_name: item.promo_name, discount_type: item.promo_discount_type, promo_discount_value: item.promo_discount_value, max_discount: item.max_promo_discount_value, minimumorder: item.min_order },
                            data.payableAmmount = data.amount - discount
                            this.setState({
                              payDetails:data
                            }, () => {
                                this.setState({ promodalVisible: false, modalVisible: false, alertModalVisible: false })
                            })
                        }
                    }
                }
            // if your order value lower than minimum order value. 
        } else {
            alert(languageJSON.promo_eligiblity)
        }

    }


    openPromoModal(){
      let data = this.state.payDetails;
      data.payableAmmount = data.amount - data.discount;
      this.setState({ 
        promodalVisible: !this.state.promodalVisible,usedWalletAmmount :0,payDetails:data,useWalletCash:false
       })
    }
  render() {

    return (
      <View style={styles.mainView}>
        <Header
          backgroundColor={colors.GREY.default}
          leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { this.props.navigation.toggleDrawer(); } }}
          centerComponent={<Text style={styles.headerTitleStyle}>{languageJSON.payment}</Text>}
          containerStyle={styles.headerStyle}
          innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
        />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollStyle}>
          <View style={{flex:1,flexDirection:'column'}}>
          <View style={{flex:1,flexDirection:'row',justifyContent:'space-between', paddingLeft: 20, paddingRight: 20, marginBottom: 4}}>
            <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 22,fontWeight:'500' }}>{languageJSON.bill_details}</Text>
            <TouchableOpacity
               onPress={() => {this.openPromoModal()}}>
            <Text style={{ color: '#018509', textAlign: 'left', lineHeight: 45, fontSize: 14,fontWeight:'500' }}>{languageJSON.apply_promo}</Text>
              </TouchableOpacity> 
            </View>
            <View style={{flex:1,flexDirection:'row',justifyContent:'space-between', paddingLeft: 25, paddingRight: 25}}>
              <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 16 }}>{languageJSON.your_fare}</Text>
              <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 16 }}>{Currency} {this.state.payDetails.amount.toFixed(2)}</Text>
            </View>
            <View style={{flex:1,flexDirection:'row',justifyContent:'space-between', paddingLeft: 25, paddingRight: 25}}>
              <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 16 }}>{languageJSON.promo_discount}</Text>
    <Text style={{ color: '#BB1E1E', textAlign: 'left', lineHeight: 45, fontSize: 16 }}>- {Currency} {this.state.payDetails?this.state.payDetails.discount?this.state.payDetails.discount:'0.00':'0.00'}</Text>
            </View>
            {this.state.useWalletCash == true?
            <View style={{flex:1,flexDirection:'row',justifyContent:'space-between', paddingLeft: 25, paddingRight: 25}}>
              <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 16 }}>{languageJSON.wallet_discount}</Text>
              <Text style={{ color: '#BB1E1E', textAlign: 'left', lineHeight: 45, fontSize: 16 }}>- {Currency} {this.state.usedWalletAmmount?this.state.usedWalletAmmount.toFixed(2):'0.00'}</Text>
            </View>:null}
            
              <View style={{
                borderStyle: 'dotted',
                borderWidth: 0.5,
                borderRadius: 1,
              }}>
            </View>
            <View style={{flex:1,flexDirection:'row',justifyContent:'space-between', paddingLeft: 25, paddingRight: 25}}>
              <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 16 ,fontWeight:'500'}}>{languageJSON.grand_total}</Text>
              <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 16,fontWeight:'500' }}>{Currency} {this.state.payDetails.payableAmmount?(this.state.payDetails.amount - this.state.payDetails.discount).toFixed(2):0.00}</Text>
            </View>
            <View style={{flex:1,flexDirection:'row',justifyContent:'space-between', paddingLeft: 25, paddingRight: 25}}>
              <Text style={{ color: '#018509', textAlign: 'left', lineHeight: 45, fontSize: 18 ,fontWeight:'500'}}>{languageJSON.payable_ammount}</Text>
              <Text style={{ color: '#018509', textAlign: 'left', lineHeight: 45, fontSize: 18,fontWeight:'500' }}>{Currency} {this.state.payDetails.payableAmmount?this.state.payDetails.payableAmmount.toFixed(2):0.00}</Text>
            </View>
          </View>

            <View style={{ flex: 1 }}>
              <CheckBox
              center
              disabled ={this.state.walletBalance>0?false:true}
              title={languageJSON.use_wallet_balance + Currency + this.state.walletBalance.toFixed(2) +')'}
              checked={this.state.useWalletCash}
              containerStyle={{ backgroundColor: colors.WHITE, borderWidth: 0, borderColor: colors.WHITE, alignSelf: 'flex-start' }}
              onPress={() => {this.useWallet()}}>
              </CheckBox>
              
            </View>
         {this.state.useWalletCash == true && this.state.walletBalance >= this.state.payDetails.amount?
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonWrapper}
                onPress={() => {
                  this.walletPayment()

                }}>
                <Text style={styles.buttonTitle}>{languageJSON.paynow_button}</Text>
              </TouchableOpacity>
          </View>
:
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={() => {
                this.cashPayment()

              }}>
              <Text style={styles.buttonTitle}>{languageJSON.pay_cash}</Text>
            </TouchableOpacity>

            <View style={{ height: 45, width: '100%', backgroundColor: '#d9d9d9', flex: 1, justifyContent: 'space-between', flexDirection: 'row', paddingLeft: 8, paddingRight: 10, marginBottom: 12 }}>
              <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 16 }}>{languageJSON.pay_card}</Text>
              {this.state.dropdown == true ? <Icon
                name='keyboard-arrow-down'
                type='MaterialIcons'
                color='#000'
                size={40}
                iconStyle={{ lineHeight: 48 }}
                onPress={() => this.dropDown('up')}
              /> :
                <Icon
                  name='keyboard-arrow-up'
                  type='MaterialIcons'
                  color='#000'
                  size={40}
                  iconStyle={{ lineHeight: 48 }}
                  onPress={() => this.dropDown('down')}
                />
              }
            </View>
            {this.state.dropdown == false ?
              <View>
                <View style={styles.cardContainer}>
                  <CreditCardInput
                    requiresName
                    requiresCVV
                    allowScroll={true}
                    onChange={this.onCardChange}
                  />
                </View>
                <CheckBox
                  center
                  title='Save your card details?'
                  checked={this.state.savedCardchecked}
                  containerStyle={{ backgroundColor: colors.WHITE, borderWidth: 0, borderColor: colors.WHITE, alignSelf: 'flex-start' }}
                  onPress={() => this.setState({ savedCardchecked: !this.state.savedCardchecked })}
                />
                <TouchableOpacity
                  style={styles.buttonWrapper2}
                  onPress={() => {
                    this.cardPayment();
                  }}>
                  <Text style={styles.buttonTitle}>{languageJSON.proceed_pay}</Text>
                </TouchableOpacity>
              </View>
              : null}
              
             <View style={{ height: 45, width: '100%', backgroundColor: '#d9d9d9', flex: 1, justifyContent: 'space-between', flexDirection: 'row', paddingLeft: 8, paddingRight: 10, marginBottom: 12 }}>
              <Text style={{ color: '#000', textAlign: 'left', lineHeight: 45, fontSize: 16 }}>{languageJSON.save_card}</Text>
              {this.state.sdropdown == true ? <Icon
                name='keyboard-arrow-down'
                type='MaterialIcons'
                color='#000'
                size={40}
                iconStyle={{ lineHeight: 48 }}
                onPress={() => this.saveCarddropDown('up')}
              /> :
                <Icon
                  name='keyboard-arrow-up'
                  type='MaterialIcons'
                  color='#000'
                  size={40}
                  iconStyle={{ lineHeight: 48 }}
                  onPress={() => this.saveCarddropDown('down')}
                />
              }
            </View>
            {this.state.sdropdown == false ?
              <View>
                {

                  this.state.savedCards.map((u, i) => {
                    return (
                      <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', height: 60, marginHorizontal: 4, borderRadius: 8, borderColor: '#d9d9d9', borderWidth: 1, marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <CheckBox
                            checked={u.selected}
                            checkedIcon='dot-circle-o'
                            uncheckedIcon='circle-o'
                            size={35}
                            containerStyle={{ backgroundColor: colors.WHITE, borderWidth: 0, borderColor: colors.WHITE, alignSelf: 'flex-start' }}
                            onPress={() => this.saveCardPaymentSelect(i)}
                          />
                        </View>
                        <View style={{ flex: 3 }}>
                          <Text style={{ fontSize: 18, color: colors.GREY.default }}>{u.values?u.values.number? "xxxxxxxxxxxx" + u.values.number.substring(15) :'': ''}</Text>
                          <Text style={{ fontSize: 17, color: '#d9d9d9' }}>{u.values ?u.values.type? u.values.type :'': ''}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Icon
                            size={35}
                            name='ios-trash'
                            type='Ionicons'
                            color='#f50'
                            type='ionicon'
                            onPress={() => this.deleteSaveCard(u.key)} />
                        </View>
                      </View>
                    );
                  })
                }
              </View>
              : null}
          </View>
  }
        </ScrollView>

        {
          this.loading()
        }
       
        
        {
          this.enterCVV()
        }

        {
          this.promoModal()
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({

  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
    //marginTop: StatusBar.currentHeight 
  },
  headerStyle: {
    backgroundColor: colors.GREY.default,
    borderBottomWidth: 0
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: 'Roboto-Bold',
    fontSize: 20
  }, scrollStyle: {
    flex: 1,
    height: height,
    backgroundColor: colors.WHITE
  },
  container: {
    flex: 1,
    marginTop: 5,
    backgroundColor: 'white',
  },
  buttonContainer: {
    width: '100%',
    //position: 'absolute',
    //bottom: 10
  },

  buttonWrapper: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.GREY.default,
    borderRadius: 8,
    marginTop: 10,

  },
  
  buttonWrapper2: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 10,
    marginTop: 20,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.GREY.default,
    borderRadius: 8,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 18,
  },
  newname: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailInputContainer: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 10,
    backgroundColor: colors.WHITE,
    paddingRight: 10,
    paddingTop: 10,
    width: width - 80
  },
  errorMessageStyle: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  inputTextStyle: {
    color: colors.BLACK,
    fontSize: 16
  },
  pinbuttonStyle: { elevation: 0, bottom: 15, width: '80%', alignSelf: "center", borderRadius: 20, borderColor: "transparent", backgroundColor: colors.GREY.btnPrimary, },
  pinbuttonContainer: { flex: 1, justifyContent: 'center' },
  inputContainer: { flex: 3, justifyContent: "center", marginTop: 40 },
  pinheaderContainer: { height: 250, backgroundColor: '#fff', width: '80%', justifyContent: 'space-evenly' },
  pinheaderStyle: { flex: 1, flexDirection: 'column', backgroundColor: colors.GREY.default, justifyContent: "center" },
  forgotPassText: { textAlign: "center", color: '#fff', fontSize: 20, width: "100%" },
  pinContainer: { flexDirection: "row", justifyContent: "space-between" },
  forgotStyle: { flex: 3, justifyContent: "center", alignItems: 'center' },
  crossIconContainer: { flex: 1, left: '40%' },
  forgot: { flex: 1 },
  pinbuttonTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    width: '100%',
    textAlign: 'center'
  },
  newname2: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  emailInputContainer2: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 10,
    backgroundColor: colors.WHITE,
    paddingRight: 10,
    paddingTop: 10,
    width: width - 80,

  },

  inputTextStyle2: {
    color: colors.BLACK,
    fontSize: 14
  },
  buttonStyle2: { elevation: 0, bottom: 15, width: '80%', alignSelf: "center", borderRadius: 20, borderColor: "transparent", backgroundColor: colors.GREY.btnPrimary, },
  buttonContainer2: { flex: 1, justifyContent: 'center', marginTop: 5 },
  inputContainer2: { flex: 4, paddingBottom: 25 },
  headerContainer2: { height: 380, backgroundColor: '#fff', width: '80%', justifyContent: 'center' },
  headerStyle2: { flex: 1, flexDirection: 'column', backgroundColor: colors.GREY.default, justifyContent: "center" },
  forgotPassText2: { textAlign: "center", color: '#fff', fontSize: 16, width: "100%" },
  forgotContainer2: { flexDirection: "row", justifyContent: "space-between" },
  forgotStyle2: { flex: 3, justifyContent: "center" },
  crossIconContainer2: { flex: 1, left: '40%' },
  forgot2: { flex: 1 },
  buttonTitle2: {
    fontWeight: 'bold',
    fontSize: 16,
    width: '100%',
    textAlign: 'center'
  },

  containercvv: {
    flex: 1,
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingTop: 120
  },
  modalContainercvv: {
    height: 200,
    backgroundColor: colors.WHITE,
    width: "80%",
    borderRadius: 10,
    elevation: 15
  },
  crossIconContainercvv: {
    flex: 1,
    left: "40%"
  },
  blankViewStylecvv: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'flex-end',
    marginTop: 15,
    marginRight: 15
  },
  blankViewStyleOTP: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'flex-end',
   
  },
  modalHeaderStylecvv: {
    textAlign: "center",
    fontSize: 20,
    paddingTop: 10
  },
  modalContainerViewStylecvv: {
    flex: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  itemsViewStylecvv: {
    flexDirection: "column",
    // justifyContent: "space-between"
  },
  textStylecvv: {
    fontSize: 20
  },
  inputcvv: {
    fontSize: 20,
    marginBottom: 20,
    borderColor: '#D2D2D2',
    borderWidth: 1,
    borderRadius: 8,
    width: "80%",
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 10,
    paddingLeft: 10,
    textAlign: 'center'
  },
});