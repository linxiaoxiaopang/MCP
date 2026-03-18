import Mock from 'mockjs'

const PICK_PICTURES = [
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/10/06/317/2e4f201788ea4a80b79b170714917c33_t.jpeg',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/30/317/b0e53d4339ca457e9bfcbf6c37303a8e_t.jpg',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/30/648/61e3a714abbb4bab8522e5a929b346cc_t.png',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/30/648/1dffd8458b884cfe86b608179a8440fb_t.jpg',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/30/648/aac634af835d43c4b34b030fc0cc7e16_t.jpg',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/30/344/a499ad2073cf48f492878dd409fe5843_t.png',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/30/492/f6a90b2826ab4792a3b9ed22ea54d61c_t.jpg',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/30/820/94a16a59a55f4802bda1738578f0c871_t.jpg',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/30/344/94d6f8983f1048359b56ecff8a83dd6a_t.jpg',
  'https://osstestnew.zdcustom.com/media/product_image/private/2024/09/29/492/a75e87d651e44c919aeb8740b33118b4_t.jpg'
]
Mock.Random.extend({
  ossImage() {
    return this.pick(PICK_PICTURES)
  }
})

