console.log("order1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let ORDERS = [];

db.collection("orders").onSnapshot((snapshots) => {
  let snapshotsDocs = snapshots.docs;
  ORDERS = [];
  snapshotsDocs.map((doc) => {
    let docData = doc.data();
    docData.docId = doc.id;
    ORDERS.push(docData);
  });
  displayOrdersTable();
});

const ordersRowsHTML = document.querySelector("#orders-rows");

const displayOrdersTable = () => {
  let counter = -1;
  let row = "";
  for (let order of ORDERS) {
    // console.log(order);
    counter++;
    let orderStatus;
    if('completed' === order.status) {
      orderStatus = ` <p style="background-color: green;color: white;border-radius: 20px;">Completed</p>`;
    } else if('rejected' === order.status) {
      orderStatus = ` <p style="background-color: red;color: white;border-radius: 20px;">Rejected</p>`;
    } else {
      orderStatus = ` <p style="background-color: orange;color: white;border-radius: 20px;">Pending</p>`;
    }

    row += `
    <tr role="row" class="odd parent">
      <td tabindex="0">${order.orderId}</td>
      <td>
        ${order.orderAt.toString()}
      </td>
      <td>
        ${orderStatus}
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
            
            <a href="javascript:;" data-index="${counter}" onclick="completeOrder(event)"> <i class="fa fa-check" data-index="${counter}"></i>
              Complete Order
            </a>
            <a href="javascript:;" data-index="${counter}" onclick="rejectOrder(event)"> <i class="fa fa-ban" data-index="${counter}"></i>
              Reject Order
            </a>
            <a href="javascript:;" data-index="${counter}" onclick="deleteOrder(event)"> <i class="fa fa-trash" data-index="${counter}"></i>
              Delete Order
            </a>
          </div>
        </div>
      </td>
    </tr>
    `;
  }
  ordersRowsHTML.innerHTML = row;
  $("#example2").DataTable({
    responsive: true,
    autoWidth: false,
  });
};


const completeOrder = e => {
  const index = e.target.dataset.index;
  // console.log(index);
  let dbRef = db.collection('orders').doc(ORDERS[index].docId);
  dbRef.get().then(orderDoc => {
    let orderData = orderDoc.data();
    orderData.status = 'completed';
    dbRef.update(orderData);
  })

  let userRef = db.collection('Customers').doc(ORDERS[index].user);
  userRef.get().then(userDoc => {
    let userData = userDoc.data();
    console.log(userData);
    for(uorder of userData.orders) {
      if(uorder.orderId === ORDERS[index].order.orderId) {
        console.log(uorder);
        uorder.status = 'completed';
        console.log(userData);
        userRef.update(userData);
        console.log('done');
        break;
      }
    }
  }).catch(error => {
    console.log(error);
  })
}

const rejectOrder = e => {
  const index = e.target.dataset.index;
  console.log(index);
  let dbRef = db.collection('orders').doc(ORDERS[index].docId);
  dbRef.get().then(orderDoc => {
    let orderData = orderDoc.data();
    orderData.status = 'rejected';
    dbRef.update(orderData);
  })

  let userRef = db.collection('Customers').doc(ORDERS[index].user);
  userRef.get().then(userDoc => {
    let userData = userDoc.data();
    console.log(userData);
    for(uorder of userData.orders) {
      if(uorder.orderId === ORDERS[index].order.orderId) {
        console.log(userData);
        uorder.status = 'rejected';
        userRef.update(userData);
        break;
      }
    }
  }).catch(error => {
    console.log(error);
  })
}

const deleteOrder = e => {
  const index = e.target.dataset.index;
  console.log(index);
  let userRef = db.collection('orders').doc(ORDERS[index].docId);
  userRef.delete();
}

const productDetailsHTML = document.querySelector("#product-details");
const productPriceHTML = document.querySelector("#product-price");
const prodsTotalHTML = document.querySelector("#prods-total");
const userDetailsHTML = document.querySelector("#userDetails");
const orderForHTML = document.querySelector('#orderFor');
const orderTypeHTML = document.querySelector('#orderType');

const OrderDetailsModal = async (e) => {
  $("#OrderDetailsModal").modal();
  const index = e.target.dataset.index;
  // console.log(index);
  let row = "";
  let prodSummery = [];

  for (let prod of ORDERS[index].order.products) {
    await db
      .collection(prod.cat)
      .doc(prod.prodId)
      .get()
      .then((prodDoc) => {
        let prodData = prodDoc.data();
        // console.log(prodData);
        let pInfo = `
      <td>---</td>
      <td>---</td>
      <td>---</td>
      `;
        if (prod.cake) {
          pInfo = `
        <td>${prod.cake.heart ? "Heart" : "Round"}</td>
        <td>${prod.cake.flavour}</td>
        <td>${prod.cake.eggless ? "Opted" : "Not Opted"}</td>
        `;
        }
        row += `
      <tr>
        <td><img src="${prodData.mainImgUrl}" style="width: 50px; object-fit: cover;" alt=""></td>
        <td>${prodData.sno}</td>
        <td>${prodData.name}</td>
        ${pInfo}
        <td>${prod.qty}</td>
        <td>'sndogvuh oiw dhfoiv jois dfho oihs iodvho oiwhef0 h wefhv9onow feh0wh iwhefh ew f9ub'</td>
      </tr>
      `;
        prodSummery.push({ name: prodData.name });
      });
  }
  // console.log(row);

  let addPrice = "";
  if (ORDERS[index].order.addons.length > 0) {
    for (let add of ORDERS[index].order.addons) {
      await db
        .collection("addons")
        .doc(add.id)
        .get()
        .then((addDoc) => {
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
          let addGst = addBasic * (+addData.gst / 100);
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
          prodSummery.push({ name: addData.name, total: addTotal });
        });
    }
  }

  productDetailsHTML.innerHTML = row;

  let priceRow = "";
  for (let i = 0; i < ORDERS[index].basicPrice.length; i++) {
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

  let prodsTotal = "";
  let totalCost = 0;
  prodSummery.map((ps) => {
    totalCost += +ps.total;
    prodsTotal += `
    <tr>
      <td>${ps.name}</td>
      <td>${ps.total}</td>
    </tr>
    `;
  });
  prodsTotal += `
  <tr>
    <td><b>FINAL PRICE</b></td>
    <td>${totalCost}</td>
  </tr>
  `;

  prodsTotalHTML.innerHTML = prodsTotal;

  let userDetails = "";
  db.collection("Customers")
    .doc(ORDERS[index].user)
    .get()
    .then((userDoc) => {
      let userData = userDoc.data();
      userDetails = `
      <div>
        <div class="row">
          <div class="col-lg-3"><b>Name</b></div>
          <div class="col-lg-9">${
            userData.UserName ? userData.UserName : "Not Provided"
          }</div>
        </div>
        <div class="row">
          <div class="col-lg-3"><b> Email</b></div>
          <div class="col-lg-9">${
            userData.Email ? userData.Email : "Not Provided"
          }</div>
        </div>
        <div class="row">
          <div class="col-lg-3"><b>Phone Number</b> </div>
          <div class="col-lg-9">${
            userData.Phone ? userData.Phone : "Not Provided"
          }</div>
        </div>
      </div>`;
      userDetailsHTML.innerHTML = userDetails;
    });
  
  let userShipping = ORDERS[index].shipping;
  let altAddress = "";
  if (userShipping.differtAddress) {
    altAddress = `
    <hr />
    <div>
      <h5  style="text-align: center; padding: 10px !important;">Alternate Address</h5>
      <div class="row">
        <div class="col-lg-3"><b>Name</b></div>
        <div class="col-lg-9">${
          userShipping.alt_name ? userShipping.alt_name : "Not Provided"
        }</div>
      </div>
      <div class="row">
        <div class="col-lg-3"><b>Phone Number</b> </div>
        <div class="col-lg-9">${
          userShipping.alt_phone ? userShipping.alt_phone : "Not Provided"
        }</div>
      </div>
      <div class="row">
        <div class="col-lg-3"><b>Address</b> </div>
        <div class="col-lg-9">${
          userShipping.alt_address
            ? userShipping.alt_address
            : "Not Provided"
        }</div>
      </div>
      <div class="row">
        <div class="col-lg-3"><b>Landmark</b> </div>
        <div class="col-lg-9">${
          userShipping.alt_landmark
            ? userShipping.alt_landmark
            : "Not Provided"
        }</div>
      </div>
      <div class="row">
        <div class="col-lg-3"><b>ZipCode</b> </div>
        <div class="col-lg-9">${
          userShipping.alt_zip ? userShipping.alt_zip : "Not Provided"
        }</div>
      </div>
    </div>`;
  }
  let orderFor = `
  <div>
    <div class="row">
      <div class="col-lg-3"><b>Name</b></div>
      <div class="col-lg-9">${
        userShipping.name ? userShipping.name : "Not Provided"
      }</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b> Email</b></div>
      <div class="col-lg-9">${
        userShipping.email ? userShipping.email : "Not Provided"
      }</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b>Phone Number</b> </div>
      <div class="col-lg-9">${
        userShipping.phone ? userShipping.phone : "Not Provided"
      }</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b>Address</b> </div>
      <div class="col-lg-9">${
        userShipping.address ? userShipping.address : "Not Provided"
      }</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b>Landmark</b> </div>
      <div class="col-lg-9">${
        userShipping.landmark ? userShipping.landmark : "Not Provided"
      }</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b>ZipCode</b> </div>
      <div class="col-lg-9">${
        userShipping.zip ? userShipping.zip : "Not Provided"
      }</div>
    </div>
  </div>
  ${altAddress}
  `;
  orderForHTML.innerHTML = orderFor;
  
  let orderType = `
  <div>
    <div class="row">
      <div class="col-lg-3"><b>Type</b></div>
      <div class="col-lg-9">${ORDERS[index].shipeType ? ORDERS[index].shipeType : 'Not Provided'}</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b>Time</b></div>
      <div class="col-lg-9">${ORDERS[index].shipTime ? ORDERS[index].shipTime : 'Not Provided'}</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b>Date</b> </div>
      <div class="col-lg-9">${ORDERS[index].shipDate ? ORDERS[index].shipDate : 'Not Provided'}</div>
    </div>
  </div>
  `;
  orderTypeHTML.innerHTML = orderType;
};
