console.log("index1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

let ORDERS = [];
let CUSTOMERS = [];
let PRODUCTS = [];
let CAT = [];

const allOrdersHTML = document.querySelector('#all-orders');
const allIncomeHTML = document.querySelector('#all-income');
const ordersDetailsHTML = document.querySelector('#orders-details');

const displayOrdersInfo = () => {
  let locAdminOrders = window.localStorage.getItem("locAdminOrders");
  if (locAdminOrders) {
    locAdminOrders = JSON.parse(locAdminOrders);
    // console.log(locAdminOrders);
    allOrdersHTML.innerHTML = locAdminOrders.totalOrders;
    allIncomeHTML.innerHTML = `₹ ${locAdminOrders.totalIncome}`;
    let row = '';
    for(let o of locAdminOrders.details) {
      // console.log(o);
      let orderStatus = '';
      if ("completed" === o.status) {
        orderStatus = `<span class="badge badge-success">Completed</span>`;
      } else if ("rejected" === o.status) {
        orderStatus = ` <span class="badge badge-danger">Rejected</span>`;
      } else {
        orderStatus = ` <span class="badge badge-warning">Pending</span>`;
      }
      row += `
      <tr>
        <td>${o.orderId}</td>
        <td>${o.orderAt}</td>
        <td>${orderStatus}</td>
        <td>
          <div class="sparkbar" data-color="#00a65a" data-height="20" style="text-align: left;">₹ ${o.total}</div>
        </td>
      </tr>
      `;
    }
    ordersDetailsHTML.innerHTML = row;
  }
};
displayOrdersInfo();

const allCutomersHTML = document.querySelector('#all-cutomers');
const cutomerDetailsHTML = document.querySelector('#cutomer-details');

const displayCustomerssInfo = () => {
  let locAdminCustomers = window.localStorage.getItem("locAdminCustomers");
  if (locAdminCustomers) {
    locAdminCustomers = JSON.parse(locAdminCustomers);
    // console.log(locAdminCustomers);
    allCutomersHTML.innerHTML = locAdminCustomers.totalCustomers;
    let row = '';
    for(let c of locAdminCustomers.details) {
      // console.log(c);
      let img;
      if(c.Image === 'null') {
        img = `<img src="./assets/images/logo.png" style="width: 150px;" alt="User Image">`;
      } else {
        img = `<img src="${c.Image}" style="width: 150px;" alt="User Image">`;
      }
      row += `
      <li>
        ${img}
        <p class="users-list-name" href="#">${c.UserName}</p>
        <p class="users-list-name" href="#">${c.Email}</p>
        <span class="users-list-date">${c.Phone}</span>
      </li>
      `; 
    }
    cutomerDetailsHTML.innerHTML = row;
  }
};
displayCustomerssInfo();

let productsDetailsHTML = document.querySelector('#products-details');
const displayProductssInfo = () => {
  let locAdminProducts = window.localStorage.getItem("locAdminProducts");
  if (locAdminProducts) {
    locAdminProducts = JSON.parse(locAdminProducts);
    // console.log(locAdminProducts);
    let row = '';
    for(let p of locAdminProducts) {
      // console.log(p);
      row += `
      <tr>
        <td>${p.catName}</td>
        <td>${p.totalProds}</td>
      </tr>
      `;
    }
    productsDetailsHTML.innerHTML = row;
  }
};
displayProductssInfo();

const allVisitorsHTML = document.querySelector('#all-visitors');
db.collection('miscellaneous').doc('visitors').onSnapshot(visitorDoc => {
  let visitorData = visitorDoc.data();
  allVisitorsHTML.innerHTML = visitorData.count;
})

db.collection("orders")
  .onSnapshot((orderSnaps) => {
    let orderSnapsDocs = orderSnaps.docs;
    let totalIncome = 0;
    let totalOrders = 0;
    for (let o of orderSnapsDocs) {
      let oData = o.data();
      totalIncome += oData.total;
      ORDERS.push(oData);
      totalOrders++;
    }
    function compare(a, b) {
      let o1 = a.timeStamp;
      let o2 = b.timeStamp;

      return o2 - o1;
    }
    ORDERS.sort(compare);
    ORDERS.length = 8;
    // console.log(ORDERS);
    let ordersData = {
      details: ORDERS,
      totalOrders: totalOrders,
      totalIncome: totalIncome,
    };
    window.localStorage.setItem("locAdminOrders", JSON.stringify(ordersData));
    displayOrdersInfo();
  });

db.collection("Customers")
  .onSnapshot((customerSnaps) => {
    let customerSnapsDocs = customerSnaps.docs;
    let totalCustomers = 0;
    for (let c of customerSnapsDocs) {
      let cData = c.data();
      totalCustomers++;
      CUSTOMERS.push(cData);
    }

    function compare(a, b) {
      let c1 = a.createdDtm;
      let c2 = b.createdDtm;

      return c2 - c1;
    }
    CUSTOMERS.sort(compare);
    CUSTOMERS.length = 8;
    let customersData = {
      details: CUSTOMERS,
      totalCustomers: totalCustomers
    }
    window.localStorage.setItem("locAdminCustomers", JSON.stringify(customersData));

    displayCustomerssInfo();
  });

db.collection("categories")
  .onSnapshot((catSnaps) => {
    let catSnapsDocs = catSnaps.docs;

    for (let cat of catSnapsDocs) {
      CAT.push({ id: cat.id, data: cat.data() });
    }
    extractProducts();
  });

const extractProducts = async () => {
  for (let cat of CAT) {
    await db
      .collection(cat.id)
      .get()
      .then((prodSnaps) => {
        let prodSnapsDocs = prodSnaps.docs;
        PRODUCTS.push({
          catName: cat.data.name,
          totalProds: prodSnapsDocs.length,
        });
      });
  }
  window.localStorage.setItem("locAdminProducts", JSON.stringify(PRODUCTS));
  displayProductssInfo();
};

