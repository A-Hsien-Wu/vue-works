import { modal_message , modal_product } from './components.js';

// ⇣ 加入 veeValidate 驗證，全部加入（for cdn）
Object.keys(VeeValidateRules).forEach(rule => {
   if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
   }
});

// ⇣ 加入 veeValidate 多國語系
VeeValidateI18n.loadLocaleFromURL('./js/zh_TW.json');

// Activate the locale
VeeValidate.configure({
   generateMessage: VeeValidateI18n.localize('zh_TW'),
   validateOnInput: true, // 調整為輸入字元立即進行驗證（輸入文字，立即驗證）
});

const vueApp = Vue.createApp({
   data() {
      return {
         url                  : 'https://vue3-course-api.hexschool.io/v2',    // 請加入站點
         path                 : 'a-hsien', // 請加入個人 API Path
         products             : [],
         noImageUrl           : './images/no_image_icon_02.png',
         modelProduct         : {
            title             : undefined,
            category          : undefined,
            origin_price      : undefined,
            price             : undefined,
            unit              : '個',
            stock             : 0,
            description       : undefined,
            content           : undefined,
            is_enabled        : 0,
            imageUrl          : '',
            imagesUrl         : [],
         },
         leadForm             : { 
            message           : '',
            user              : { name: '', email: '', tel: '', address: '', },
         },
         isLoading            : false,
         cart                 : {},
         addBtnArr            : [],
      }
   },
   methods: {
      apiGetAllProducts(){ // 取得所有產品資料
         axios.get( `${this.url}/api/${ this.path }/products?page=2` ).then( response => {
            // console.log('get all:' , response.data);
            this.products = [ ...response.data.products ];
         }).catch( error => {
            // console.log('get all error:' , error.data.message);
         });
      },
      apiAddToCart(item , quantity=1){   // 將商品加入購物車
         const tempCart = { product_id : item.id , qty : quantity };
         this.isLoading = true;
         axios.post( `${this.url}/api/${ this.path }/cart` , { data: tempCart } ).then( response => {
            this.isLoading = false;
            this.$refs.modalMessage.callMessage( `商品「${item.title}」 已成功加入購物車！` );
            this.apiGetCart();
         }).catch( error => {
            this.isLoading = false;
            this.$refs.modalMessage.callMessage( `Oops! 「${error.data.message}」` , 'error' );
         });
      },
      apiUpdateCartItem( item ){ // 修改個別選單數量
         // console.log('update:' , item);
         this.isLoading = true;
         const itemData = { product_id : item.product_id , qty : item.qty };
         axios.put( `${this.url}/api/${ this.path }/cart/${item.id}` , { data: itemData } ).then( response => {
            // console.log('update cart:' , response.data);
            this.$refs.modalMessage.callMessage( `${item.product.title}：${item.qty + item.product.unit}` , 'qty' );
            this.isLoading = false;
            this.apiGetCart();
         }).catch( error => {
            this.isLoading = false;
            this.$refs.modalMessage.callMessage( `Oops! 「${error.data.message}」` , 'error' );
         });
      },
      apiEmptyCarts(){  // 刪除購物車的內容
         this.isLoading = true;
         axios.delete( `${this.url}/api/${ this.path }/carts` ).then( response => {
            // console.log('empty cart:' , response.data);
            this.isLoading = false;
            this.$refs.modalMessage.callMessage( `購物車已清空！` , 'empty' );
            this.apiGetCart();
         }).catch( error => {
            this.isLoading = false;
            this.$refs.modalMessage.callMessage( `Oops! 「${error.data.message}」` , 'error' );
         });
      },
      apiDeleteCartItem( id ){   // 刪除購物籃內的個別選項
         this.isLoading = true;
         axios.delete( `${this.url}/api/${ this.path }/cart/${id}` ).then( response => {
            console.log('delete item:' , response.data);
            this.$refs.modalMessage.callMessage( `商品已刪除！` );
            this.isLoading = false;
            this.apiGetCart();
         }).catch( error => {
            this.isLoading = false;
            this.$refs.modalMessage.callMessage( `Oops! 「${error.data.message}」` , 'error' );
         });
      },
      apiCreateLeadForm(){  // 送出客戶填寫表單
         this.isLoading = true;
         axios.post( `${this.url}/api/${ this.path }/order` , { data : this.leadForm } ).then( response => {
            // console.log('apiCreateLeadForm:' , response.data);
            this.isLoading = false;
            this.$refs.leadForm.resetForm();
            this.apiGetCart();
         }).catch( error => {
            this.isLoading = false;
            this.$refs.modalMessage.callMessage( `Oops! 「${error.data.message}」` , 'error' );
         });
      },
      apiGetCart(){  // 取得購物車資料
         axios.get( `${this.url}/api/${ this.path }/cart` ).then( response => {
            this.cart = response.data.data;
            setTimeout(() => { this.changeAddBtn( this.cart.carts ); }, 100);
            // this.changeAddBtn( this.cart.carts );
         }).catch( error => {
            this.isLoading = false;
            this.$refs.modalMessage.callMessage( `Oops! 「${error.data.message}」` , 'error' );
         });
      },
      changeAddBtn( addedCarts ){
         // console.log('hasBtnRef' , this.$refs.addCart_btn);
         const addedProductIds = addedCarts.map( item => item.product_id );
         this.$refs?.addCart_btn?.filter( btn => {
            btn.disabled  = false;
            btn.innerHTML = 'Add to Bag';
            return ( addedProductIds.indexOf( btn.dataset.id ) != -1 );
         }).forEach( btn => {
            btn.disabled  = true;
            btn.innerHTML = 'Added';
         })
      },
      loadPhotoSuccess(event){    // 載圖成功
         // console.log('loadPhotoSuccess:' , event);
      },
      loadPhotoError(event){  // 載圖失敗
         event.target.src = this.noImageUrl;
      },
      discountPercent( price=0 , origin_price=0 ){    // 計算折扣率
         return Math.round( -(100 - (price / origin_price) * 100) ) ;
      },
      clickToFillOut(){    // 假資料，方便直接輸入客戶資料
         this.leadForm.user.email = 'foo@example.com';
         this.leadForm.user.name = 'Foo Bar';
         this.leadForm.user.tel = '0987654321';
         this.leadForm.user.address = '27 E Valley Blvd, Alhambra, CA 91801';
         this.leadForm.message = 'A numeric value representing the exact number of items the value can contain.';
      },
      playLoading(){ // for .use( VueLoading.Plugin );
         let loader = this.$loading.show({
            container: this.fullPage ? null : this.$refs.formContainer,
            // canCancel: true,
            onCancel: this.onCancel,
         });
      },
   },
   computed:{
      hasAnyCart(){  // 清空購物車，是否隱藏相關元素
         return !(this.cart.carts == 0); 
      },
   },
   components: {
      modal_message, modal_product
   },
   created() {
      this.apiGetAllProducts();
      this.apiGetCart();
   },
   mounted() {
      // this.addBtnArr = [...this.$refs.addCart_btn];
   },
});
// vueApp.use( VueLoading.Plugin );
vueApp.component( 'Loading' , VueLoading.Component ); // 全域註冊 Loading，Loading 這個名稱可以自訂
vueApp.component( 'VForm' , VeeValidate.Form);
vueApp.component( 'VField' , VeeValidate.Field);
vueApp.component( 'ErrorMessage' , VeeValidate.ErrorMessage);
vueApp.mount('#app');
