export const registerFormControls = [
  {
    name: "userName",
    label: "Tên người dùng",
    placeholder: "Nhập tên người dùng",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Nhập Email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Mật khẩu",
    placeholder: "Nhập mật khẩu",
    componentType: "input",
    type: "password",
  },
  {
    name: "confirmPassword",
    label: "Xác nhận mật khẩu",
    placeholder: "Nhập lại mật khẩu",
    type: "password",
  }
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Nhập email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Mật khẩu",
    placeholder: "Nhập mật khẩu",
    componentType: "input",
    type: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Tên sản phẩm",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Nhập tên sản phẩm",
  },
  {
    label: "Mô tả",
    name: "Mô tả",
    componentType: "textarea",
    placeholder: "Nhập mô tả sản phẩm",
  },
  {
    label: "Danh Mục",
    name: "Category",
    componentType: "select",
    options: [
      { id: "men", label: "Nam" },
      { id: "women", label: "Nữ" },
      { id: "kids", label: "Trẻ em" },
      { id: "accessories", label: "Phụ kiện" },
    ],
  },
  {
    label: "Hãng",
    name: "Brand",
    componentType: "select",
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "new_balance", label: "New Balance" },
      { id: "mlb", label: "MLB" },
    ],
  },
  {
    label: "Giá nhập",
    name: "importPrice",
    componentType: "input",
    type: "number",
    placeholder: "Nhập giá nhập",
  },
  {
    label: "Giá bán",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Nhập giá bán",
  },
  {
    label: "Giá khuyến mãi",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Nhập giá khuyến mãi (Không bắt buộc)",
  },
  {
    label: "Tổng số lượng nhập",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Nhập tổng số lượng nhập",
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "menu.home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "menu.products",
    path: "/shop/listing",
  },
  {
    id: "men",
    label: "menu.men",
    path: "/shop/listing",
  },
  {
    id: "women",
    label: "menu.women",
    path: "/shop/listing",
  },
  {
    id: "kids",
    label: "menu.kids",
    path: "/shop/listing",
  },
  {
    id: "accessories",
    label: "menu.accessories",
    path: "/shop/listing",
  },
  {
    id: "search",
    label: "menu.search",
    path: "/shop/search",
  },
];

export const categoryOptionsMap = {
  men: "category.men",
  women: "category.women",
  kids: "category.kids",
  accessories: "category.accessories",
};

export const brandOptionsMap = {
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  new_balance: "New Balance",
  mlb: "MLB",
};

export const filterOptions = {
  category: [
    { id: "men", label: "category.men" },
    { id: "women", label: "category.women" },
    { id: "kids", label: "category.kids" },
    { id: "accessories", label: "category.accessories" },
    
  ],
  brand: [
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "puma", label: "Puma" },
    { id: "new_balance", label: "New Balance" },
    { id: "mlb", label: "MLB" },
  ]
};
export const filterNameMap = {
  category: "filter.category",
  brand: "filter.brand",
  size: "filter.size",
  color: "filter.color",
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Giá: Từ thấp đến cao" },
  { id: "price-hightolow", label: "Giá: Từ cao đến thấp" },
  { id: "title-atoz", label: "Tên: Từ A -> Z" },
  { id: "title-ztoa", label: "Tên: Từ Z -> A" },
];

export const addressFormControls = [
  {
    label: "Địa chỉ",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Nhập địa chỉ của bạn",
  },
  {
    label: "Thành phố",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Nhập thành phố",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Nhập pincode",
  },
  {
    label: "Số điện thoại",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Nhập số điện thoại",
  },
  {
    label: "Ghi chú",
    name: "notes",
    componentType: "textarea",
    placeholder: "Nhập ghi chú (nếu có)",
  },
];

export const forgotPasswordFormControls = [
  {
    label: 'Email',
    name: 'email',
    type: 'email',
    placeholder: 'Nhập email của bạn',
    required: true,
  }
]
