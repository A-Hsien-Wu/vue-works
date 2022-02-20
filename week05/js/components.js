export const close_btn = {
   template : `
      <button type="button" class="text-gray-400 hover:text-gray-500 hover-spin-180" 
         @click.self="$emit('emit_event')">
         <span class="sr-only">Close</span>
         <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" 
            viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
         </svg>
      </button>`,
}

export const modal_message = {
   template: `
   <div class="invisible">
      <div class="w-full md:w-[500px] fixed top-0 md:left-1/2 md:ml-[-250px] shadow-md rounded-lg overflow-hidden">
         <div class="px-6 py-3 text-sm fx-center-x gap-4 overflow-hidden"
            :class="style">
            <img src="./images/check_circle_black_24dp.svg" class="w-4 aspect-square object-cover filter-blue-800">
            <span>{{message}}</span>
         </div>
      </div>
   </div>`,
   data() {
      return {
         isDisplay: false,
         message: '',
         style: [ 'bg-blue-100' , 'text-blue-800' ],
         tweenMaxDefault: { ease: "power4.inOut" , duration: .6 },
      }
   },
   methods: {
      callMessage( msg , status='added' ){
         this.isDisplay = true;
         this.message = msg;
         if( status === 'added' ){
            this.style = [ 'bg-blue-100' , 'text-blue-800' ];
         }
         else if( status === 'empty' ){
            this.style = [ 'bg-white' , 'text-gray-800' ];
         }
         else if( status === 'qty' ){
            this.style = [ 'bg-green-100' , 'text-green-800' ];
         }
         else if( status === 'error' ){
            this.style = [ 'bg-red-100' , 'text-red-800' ];
         }
      },
   },
   watch: {
      isDisplay(value){
         gsap.to( this.$el , { ...this.tweenMaxDefault , autoAlpha: (value ? 1 : 0) }); 
         gsap.fromTo( this.$el.children , 
            { ...this.tweenMaxDefault , y: (value ? -60 : 0) },
            { ...this.tweenMaxDefault , y: (value ? 0 : -60) }); 
         // this.$el to get this component itself
         if(value) {
            setTimeout(() => { this.isDisplay = false }, 800);
         }
      },
      
   },
   mounted() {},
};

export const modal_product = {
   template : '#template-modal-product',
   data() {
      return {
         noImageUrl     : './images/no_image_icon_02.png',
         isModalShow    : false,
         hasAdded       : false,
         emptyProduct   : {},
         product        : {
            title       : '',
            category    : '',
            price       : 0,
            content     : '',
            description : '',
            imageUrl    : '',
         },
         tweenMaxDefault: { ease: "power4.inOut" , duration: .6 },
      }
   },
   methods: {
      closeModal(){  // click x to 關閉 modal，離開 modal，將所有欄位清空，回復初始狀態
         this.isModalShow = false;
         // this.product = { ...this.emptyProduct };
         setTimeout(() => { this.product = { ...this.emptyProduct }; }, 1000);
      },
      addToCart(){   // click 加入購物車 to 關閉 modal, and process other relevant orders.
         if( !this.hasAdded ){
            this.$emit('emit_add_cart' , this.product);
         }
         this.closeModal();
      },
      callModal( item , carts ){ // 打開 modal
         this.isModalShow = true;
         this.product = Object.assign( this.product , item );
         const cartItems = carts.map( item => item.product_id );
         this.hasAdded = ( cartItems.indexOf( item.id ) !== -1 );
      },
      loadPhotoSuccess(event){    // 載圖成功
         // console.log('loadPhotoSuccess:' , event);
      },
      loadPhotoError(event){  // 載圖失敗
         event.target.src = this.noImageUrl;
      },
   },
   watch:{
      isModalShow( value ){
         gsap.to( this.$el , { ...this.tweenMaxDefault , autoAlpha: (value ? 1 : 0) } );
         gsap.to( this.$refs.modalProductContent , Object.assign( {} , this.tweenMaxDefault , { scale: (value ? 1 : 0) } ) );
      },
   },
   components: { close_btn, },
   mounted() {
      this.emptyProduct = { ...this.product };
   },
};