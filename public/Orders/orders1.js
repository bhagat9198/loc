console.log('order1.js');

const db = firebase.firestore();
const storageService = firebase.storage();

let ORDERS = [];

db.collection('orders').onSnapshot(snapshots => {
  let snapshotsDocs = snapshots.docs;
  ORDERS = [];
  snapshotsDocs.map(doc => {
    let docData = doc.data();
    ORDERS.push(docData);
  }) 
  displayOrdersTable();
})

const ordersRowsHTML = document.querySelector('#orders-rows');

const displayOrdersTable = () => {
  let counter = -1;
  let row = '';
  for(let order of ORDERS) {
    console.log(order);
    counter++;
    row += `
    <tr role="row" class="odd parent">
      <td tabindex="0">${order.orderId}</td>
      <td>
        ${order.orderAt}
      </td>
      <td>
        <p style="background-color: orange;color: white;border-radius: 20px;">Pending</p>
      </td>
      <td>₹ ${order.total}</td>
      <td>
        <div class="godropdown">
          <button data-index="${counter}" class="go-dropdown-toggle" onclick="OrderDetailsModal(event)" >
            Order Details
          </button>
        </div>
      </td>
      <td>
        <div class="godropdown">
          <button class="go-dropdown-toggle">
            Actions<i class="fas fa-chevron-down"></i>
          </button>
          <div class="action-list" style="display: none;width: 100%;">
            <a href="./AddProduct.html" data-toggle="modal" data-target="#InvoiceModal">
              <i class="fas fa-file-invoice"></i> View Invoice
            </a>
            <a href="javascript:;" data-toggle="modal" data-target="#confirm-delete"
              class="delete">
              <i class="fa fa-check"></i>
              Complete Order
            </a>
            <a href="javascript:;" data-toggle="modal" data-target="#CoupenSystemModal"
              class="dele">
              <i class="fa fa-ban"></i>
              Reject Order
            </a>
          </div>
        </div>
      </td>
    </tr>
    `;
  }
  ordersRowsHTML.innerHTML = row;
  $('#example2').DataTable({
    "responsive": true,
    "autoWidth": false,
  });
}


const productDetailsHTML = document.querySelector('#product-details');
const productPriceHTML = document.querySelector('#product-price');
const prodsTotalHTML = document.querySelector('#prods-total');

const OrderDetailsModal = async(e) => {
  $('#OrderDetailsModal').modal();
  const index = e.target.dataset.index;
  // console.log(index);
  let row = '';
  let prodSummery = [];

  for(let prod of  ORDERS[index].order.products) {
    await db.collection(prod.cat).doc(prod.prodId).get().then(prodDoc => {
      let prodData = prodDoc.data();
      // console.log(prodData);
      let pInfo = `
      <td>---</td>
      <td>---</td>
      <td>---</td>
      `;
      if(prod.cake) {
        pInfo = `
        <td>${prod.cake.heart ? 'Heart' : 'Round'}</td>
        <td>${prod.cake.flavour}</td>
        <td>${prod.cake.eggless ? 'Opted' : 'Not Opted'}</td>
        `;
      }
      row += `
      <tr>
        <td><img src="${prodData.mainImgUrl}" style="width: 50px; object-fit: cover;" alt=""></td>
        <td>${prodData.sno}</td>
        <td>${prodData.name}</td>
        ${pInfo}
        <td>${prod.qty}</td>
        <td>${prod.message}</td>
      </tr>
      `;
      prodSummery.push({name: prodData.name});
    });
  }
  // console.log(row);

  let addPrice = '';
  if(ORDERS[index].order.addons.length > 0) {
    for(let add of  ORDERS[index].order.addons) { 
      await db.collection('addons').doc(add.id).get().then(addDoc => {
        let addData = addDoc.data();
        console.log(addData);
        row += `
        <tr>
          <td><img src="${addData.imgUrl}" style="width: 50px; object-fit: cover;" alt=""></td>
          <td>---</td>
          <td>${addData.name}</td>
          <td>---</td>
          <td>---</td>
          <td>---</td>
          <td>${add.qty}</td>
          <td>---</td>
        </tr>
        `;

        let addBasic = +addData.sp * +add.qty;
        let addGst = addBasic * (+addData.gst/100);
        let addTotal = addBasic + addGst;
        addPrice += `
        <tr>
          <td>₹ ${addData.sp * +add.qty}</td>
          <td>---</td>
          <td>---</td>
          <td>₹ ${addGst}</td>
          <td>₹ ${addTotal}</td>
        </tr>
        `;
        prodSummery.push({name: addData.name, total: addTotal});
      })
    }
  }

  productDetailsHTML.innerHTML = row;

  let priceRow = ''
  for(let i = 0; i < ORDERS[index].basicPrice.length; i++) {
    let prodBasic = +ORDERS[index].basicPrice[i];
    let prodDiscount = +ORDERS[index].disArr[i];
    let discountedPrice = prodBasic - prodDiscount;
    let prodGst = +ORDERS[index].gstArr[i];
    let prodTotal = Math.round(discountedPrice + prodGst);
    priceRow = `
    <tr>
      <td>₹ ${prodBasic}</td>
      <td>₹ ${prodDiscount}</td>
      <td>₹ ${discountedPrice}</td>
      <td>₹ ${prodGst}</td>
      <td>₹ ${prodTotal}</td>
    </tr>
    `;

    prodSummery[i].total = prodTotal;
  }
  productPriceHTML.innerHTML = priceRow + addPrice;

  let prodsTotal = '';
  let totalCost = 0;
  prodSummery.map(ps => {
    totalCost += +ps.total;
    prodsTotal += `
    <tr>
      <td>${ps.name}</td>
      <td>${ps.total}</td>
    </tr>
    `;
  })
  prodsTotal += `
  <tr>
    <td><b>FINAL PRICE</b></td>
    <td>${totalCost}</td>
  </tr>
  `;

  prodsTotalHTML.innerHTML = prodsTotal;


  let userDetails = '';

  userDetails = `
  <div>
    <h3>Order Person Details</h3>
    <div class="row">
      <div class="col-lg-4">Name</div>
      <div class="col-lg-8">User</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Email</div>
      <div class="col-lg-8">User@user.com</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Phone Number</div>
      <div class="col-lg-8">1234567890</div>
    </div>
  </div>
  <div>
    <h3>Order Made for</h3>
    <div class="row">
      <div class="col-lg-4">Name</div>
      <div class="col-lg-8">User</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Email</div>
      <div class="col-lg-8">User@user.com</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Phone Number</div>
      <div class="col-lg-8">1234567890</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Address</div>
      <div class="col-lg-8">1234567890</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Landmark</div>
      <div class="col-lg-8">1234567890</div>
    </div>
    <div class="row">
      <div class="col-lg-4">ZipCode</div>
      <div class="col-lg-8">1234567890</div>
    </div>
  </div>
  <div>
    <h5>Alternate Address</h5>
    <div class="row">
      <div class="col-lg-4">Name</div>
      <div class="col-lg-8">User</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Email</div>
      <div class="col-lg-8">User@user.com</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Phone Number</div>
      <div class="col-lg-8">1234567890</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Address</div>
      <div class="col-lg-8">1234567890</div>
    </div>
    <div class="row">
      <div class="col-lg-4">Landmark</div>
      <div class="col-lg-8">1234567890</div>
    </div>
    <div class="row">
      <div class="col-lg-4">ZipCode</div>
      <div class="col-lg-8">1234567890</div>
    </div>
  </div>
  `;
}