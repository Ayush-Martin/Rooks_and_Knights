function validateProductForm(imageValidation) {
  //values
  let img1 = document.getElementById("productImage1").value.trim();
  let img2 = document.getElementById("productImage2").value.trim();
  let img3 = document.getElementById("productImage3").value.trim();
  let productName = document.getElementById("productName").value.trim();
  let price = document.getElementById("productPrice").value.trim();
  let offers = document.getElementById("productOffer").value.trim();
  let category = document.getElementById("productCategory").value.trim();
  let subCategory = document.getElementById("productSubCategory").value.trim();
  let stock = document.getElementById("productStock").value.trim();
  let productAbout = document.getElementById("productAbout").value.trim();
  let productDescription = document
    .getElementById("productDescription")
    .value.trim();

  //errors
  let productImageError = document.getElementById("productImageError");
  let productNameError = document.getElementById("productNameError");
  let priceError = document.getElementById("priceError");
  let offersError = document.getElementById("offersError");
  let categoryError = document.getElementById("categoryError");
  let subCategoryError = document.getElementById("subCategoryError");
  let stockError = document.getElementById("stockError");
  let productAboutError = document.getElementById("productAboutError");
  let productDescriptionError = document.getElementById(
    "productDescriptionError"
  );

  let flag = true;

  if (imageValidation) {
    checkImage();
  }

  checkProductName();
  checkPrice();
  checkOffer();
  checkCategory();
  checkSubCategory();
  checkStock();
  checkProductAbout();
  checkProductDescription();

  return flag;

  function checkImage() {
    if (!img1 || !img2 || !img3) {
      productImageError.innerText = "All three images should be uploaded";
      flag = false;
      return;
    }
    productImageError.innerText = ""; // Clear error if valid
  }

  function checkProductName() {
    const productNameRegex = /^[A-Za-z\s\d]{3,}$/; // Only letters and spaces, minimum length of 3
    if (!productName) {
      productNameError.innerText = "Product Name should not be empty";
      flag = false;
      return;
    } else if (!productNameRegex.test(productName)) {
      productNameError.innerText =
        "Product Name should be at least 3 characters long and only contain letters, numbers and spaces";
      flag = false;
      return;
    }
    productNameError.innerText = ""; // Clear error if valid
  }

  function checkPrice() {
    if (!price) {
      priceError.innerText = "Price should not be empty";
      flag = false;
      return;
    }
    if (price < 0) {
      priceError.innerText = "Price should not be negative";
      flag = false;
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
      // Price must be a number with up to 2 decimal places
      priceError.innerText = "Price should be a valid number";
      flag = false;
      return;
    }
    priceError.innerText = ""; // Clear error if valid
  }

  function checkOffer() {
    if (!offers) {
      offersError.innerText = "Offer value should not be empty";
      flag = false;
      return;
    }
    if (offers < 0 || offers > 100) {
      offersError.innerText = "Offer should be between 0 to 100";
      flag = false;
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(offers)) {
      // Offer should be a valid number (up to 2 decimal places)
      offersError.innerText = "Offer should be a valid number";
      flag = false;
      return;
    }
    offersError.innerText = ""; // Clear error if valid
  }

  function checkCategory() {
    const categoryRegex = /^[A-Za-z\s]+$/; // Only letters and spaces allowed
    if (!category) {
      categoryError.innerText = "Category should not be empty";
      flag = false;
      return;
    } else if (!categoryRegex.test(category)) {
      categoryError.innerText =
        "Category should only contain letters and spaces";
      flag = false;
      return;
    }
    categoryError.innerText = ""; // Clear error if valid
  }

  function checkSubCategory() {
    const subCategoryRegex = /^[A-Za-z\s]+$/; // Only letters and spaces allowed
    if (!subCategory) {
      subCategoryError.innerText = "Sub Category should not be empty";
      flag = false;
      return;
    } else if (!subCategoryRegex.test(subCategory)) {
      subCategoryError.innerText =
        "Sub Category should only contain letters and spaces";
      flag = false;
      return;
    }
    subCategoryError.innerText = ""; // Clear error if valid
  }

  function checkStock() {
    if (!stock) {
      stockError.innerText = "Number of stock should not be empty";
      flag = false;
      return;
    }
    if (stock < 0) {
      stockError.innerText = "Stock should not be negative";
      flag = false;
      return;
    }
    if (!/^\d+$/.test(stock)) {
      // Stock should be a positive integer
      stockError.innerText = "Stock should be a valid positive number";
      flag = false;
      return;
    }
    stockError.innerText = ""; // Clear error if valid
  }

  function checkProductAbout() {
    // const productAboutRegex = /^[A-Za-z\s]+$/; // Only letters and spaces allowed
    if (!productAbout) {
      productAboutError.innerText = "Product About should not be empty";
      flag = false;
      return;
    }
    //  else if (!productAboutRegex.test(productAbout)) {
    //     productAboutError.innerText = "Product About should only contain letters and spaces";
    //     flag = false;
    //     return;
    // }
    productAboutError.innerText = ""; // Clear error if valid
  }

  function checkProductDescription() {
    // const productDescriptionRegex = /^[A-Za-z\s]+$/; // Only letters and spaces allowed
    if (!productDescription) {
      productDescriptionError.innerText =
        "Product Description should not be empty";
      flag = false;
      return;
    }
    //  else if (!productDescriptionRegex.test(productDescription)) {
    //     productDescriptionError.innerText = "Product Description should only contain letters and spaces";
    //     flag = false;
    //     return;
    // }
    // productDescriptionError.innerText = ""; // Clear error if valid
  }
} // If all validations pass, you can submit the form
