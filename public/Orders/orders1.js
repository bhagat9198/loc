console.log("order1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let ORDERS = [];
let prvious = 0;
db.collection("orders").onSnapshot((snapshots) => {
  const audio = new Audio("../assets/audio/ntf.mp3");
  let snapshotsDocs = snapshots.docs;
  prvious = snapshotsDocs.length;

  if (snapshotsDocs.length > prvious - 1) {
    audio.play();
  }
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
  let completedRow = "";
  let rejectedRow = "";
  for (let order of ORDERS) {
    // console.log(order);
    counter++;
    let orderStatus;
    if ("completed" === order.status) {
      orderStatus = ` <p style="background-color: green;color: white;border-radius: 20px;">Completed</p>`;
    } else if ("rejected" === order.status) {
      orderStatus = ` <p style="background-color: red;color: white;border-radius: 20px;">Rejected</p>`;
    } else {
      orderStatus = ` <p style="background-color: orange;color: white;border-radius: 20px;">Pending</p>`;
    }
    if (order.status == "completed") {
      completedRow += `
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
       
            <a href="javascript:;" data-index="${counter}" onclick="deleteOrder(event)"> <i class="fa fa-trash" data-index="${counter}"></i>
              Delete Order
            </a>
          </div>
        </div>
      </td>
    </tr>
    `;
    } else if (order.status == "rejected") {
      rejectedRow += `
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
            
          
            <a href="javascript:;" data-index="${counter}" onclick="deleteOrder(event)"> <i class="fa fa-trash" data-index="${counter}"></i>
              Delete Order
            </a>
          </div>
        </div>
      </td>
    </tr>
    `;
    } else {
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
  }
  ordersRowsHTML.innerHTML = row;
  document.getElementById("completed-orders").innerHTML = completedRow;
  document.getElementById("rejected-orders").innerHTML = rejectedRow;
  $("#example2").DataTable({
    responsive: true,
    autoWidth: false,
  });
  $("#example3").DataTable({
    responsive: true,
    autoWidth: false,
  });
  $("#example4").DataTable({
    responsive: true,
    autoWidth: false,
  });
};

const completeOrder = (e) => {
  const index = e.target.dataset.index;
  // console.log(index);
  let dbRef = db.collection("orders").doc(ORDERS[index].docId);
  dbRef.get().then((orderDoc) => {
    let orderData = orderDoc.data();
    orderData.status = "completed";
    dbRef.update(orderData);
  });

  let userRef = db.collection("Customers").doc(ORDERS[index].user);
  userRef
    .get()
    .then((userDoc) => {
      let userData = userDoc.data();
      console.log(userData);
      for (uorder of userData.orders) {
        if (uorder.orderId === ORDERS[index].order.orderId) {
          console.log(uorder);
          uorder.status = "completed";
          console.log(userData);
          userRef.update(userData);
          console.log("done");
          break;
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const rejectOrder = (e) => {
  const index = e.target.dataset.index;
  console.log(index);
  let dbRef = db.collection("orders").doc(ORDERS[index].docId);
  dbRef.get().then((orderDoc) => {
    let orderData = orderDoc.data();
    orderData.status = "rejected";
    dbRef.update(orderData);
  });

  let userRef = db.collection("Customers").doc(ORDERS[index].user);
  userRef
    .get()
    .then((userDoc) => {
      let userData = userDoc.data();
      console.log(userData);
      for (uorder of userData.orders) {
        if (uorder.orderId === ORDERS[index].order.orderId) {
          console.log(userData);
          uorder.status = "rejected";
          userRef.update(userData);
          break;
        }
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const deleteOrder = (e) => {
  const index = e.target.dataset.index;
  console.log(index);
  let userRef = db.collection("orders").doc(ORDERS[index].docId);
  userRef.delete();
};

const productDetailsHTML = document.querySelector("#product-details");
const productPriceHTML = document.querySelector("#product-price");
const prodsTotalHTML = document.querySelector("#prods-total");
const userDetailsHTML = document.querySelector("#userDetails");
const orderForHTML = document.querySelector("#orderFor");
const orderTypeHTML = document.querySelector("#orderType");
let personalisedHTML = document.querySelector("#personalised");

const OrderDetailsModal = async (e) => {
  $("#OrderDetailsModal").modal();
  const index = e.target.dataset.index;
  console.log(ORDERS[index]);
  // console.log(index);
  let row = "";
  let prodSummery = [];
  let personliseStatus = false;
  let allPersonalise = "";
  // console.log(ORDERS[index]);
  for (let prod of ORDERS[index].order.products) {
    // await db
    // .collection(prod.cat)
    // .doc(prod.prodId)
    // .get()
    // .then((prodDoc) => {
    //   let prodData = prodDoc.data();
    //   console.log(prodData);
    let prodData = prod;
    let msg;
    // console.log(prod.message);
    if (!prod.message) {
      msg = "No message";
    } else {
      msg = prod.message;
    }

    if (prodData) {
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
            <td><img src="${prodData.img}" style="width: 50px; object-fit: cover;" alt=""></td>
            <td>${prodData.sno}</td>
            <td>${prodData.name}</td>
            ${pInfo}
            <td>${prod.qty}</td>
            <td>${msg}</td>
          </tr>
          `;
      prodSummery.push({ name: prodData.name });
    }
    // });
    
    if (prod.personalizedGiftDetails) {
      personliseStatus = true;
      let eachPersonlise = `
      <div>
        <b>Product Sno: ${prod.sno}</b> 
          <div>
            <p><b> Images </b></p> 
              <div>`;
      let eachImgs = "";
      for (let i of prod.personalizedGiftDetails.imgs) {
        eachImgs += `<img class="pImgs"  src="${i}" alt="">`;
      }
      eachPersonlise += eachImgs + `</div>`;

      if (prod.personalizedGiftDetails.titles) {
        if (prod.personalizedGiftDetails.titles.length > 0) {
          eachPersonlise += `<br>
          <p><b>Title</b></p>
             <ul>
          `;
          let li = "";
          for (let t of prod.personalizedGiftDetails.titles) {
            li += `<li>${t}</li>`;
          }
          eachPersonlise += li +`</ul>`;
        }
      }
      eachPersonlise += `</div><hr><hr>`;
      allPersonalise += eachPersonlise;
    }
  }
  if(personliseStatus) {
    personalisedHTML.innerHTML = `
      <div class="card-header" id="headingOne" style="background-color: rgb(190, 252, 22);">
        <h5 class="mb-0">
          <button class="btn btn-link" style="color: tomato; font-weight: 900; ">
            Personalised
          </button>
        </h5>
      </div>
      <div>
        ${allPersonalise}
      </div>
      `;
  } else {
    personalisedHTML.innerHTML = '';
  }
  // console.log(row);

  let addPrice = "";
  if (ORDERS[index].order.addons.length > 0) {
    for (let add of ORDERS[index].order.addons) {
      let addData = add;

      row += `
        <tr>
          <td><img src="${addData.img}" style="width: 50px; object-fit: cover;" alt=""></td>
          <td>${addData.sno}</td>
          <td>${addData.name}</td>
          <td>---</td>
          <td>---</td>
          <td>---</td>
          <td>${add.qty}</td>
          <td>---</td>
        </tr>
        `;

      let addBasic = +addData.basicPrice * +add.qty;
      let addGst = addBasic * (+addData.gst / 100);
      let addTotal = addBasic + addGst;
      addPrice += `
          <tr>
            <td>₹ ${addBasic}</td>
            <td>₹ 0</td>
            <td>₹ ${addBasic}</td>
            <td>₹ ${addGst}</td>
            <td>₹ ${addTotal}</td>
          </tr>
          `;
      prodSummery.push({ name: addData.name, total: addTotal });
    }
  }

  productDetailsHTML.innerHTML = row;

  let priceRow = "";
  for (let i = 0; i < ORDERS[index].basicPrice.length; i++) {
    let prodBasic = +ORDERS[index].basicPrice[i];
    let prodDiscount = 0,
      discountedPrice = 0;
    if (ORDERS[index].disArr.length > 0) {
      prodDiscount = +ORDERS[index].disArr[i];
    }
    discountedPrice = prodBasic - prodDiscount;
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
  prodSummery.push({
    name: `Delivery(${ORDERS[index].shipeType})`,
    total: ORDERS[index].shipeTypePrice,
  });

  let prodsTotal = "";
  let totalCost = 0;
  // console.log(prodSummery);
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
          userShipping.alt_address ? userShipping.alt_address : "Not Provided"
        }</div>
      </div>
      <div class="row">
        <div class="col-lg-3"><b>Landmark</b> </div>
        <div class="col-lg-9">${
          userShipping.alt_landmark ? userShipping.alt_landmark : "Not Provided"
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
      <div class="col-lg-9">${
        ORDERS[index].shipeType ? ORDERS[index].shipeType : "Not Provided"
      }</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b>Time</b></div>
      <div class="col-lg-9">${
        ORDERS[index].shipTime ? ORDERS[index].shipTime : "Not Provided"
      }</div>
    </div>
    <div class="row">
      <div class="col-lg-3"><b>Date</b> </div>
      <div class="col-lg-9">${
        ORDERS[index].shipDate ? ORDERS[index].shipDate : "Not Provided"
      }</div>
    </div>
  </div>
  `;
  orderTypeHTML.innerHTML = orderType;
};
