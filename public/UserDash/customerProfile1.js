console.log('customerProfile1.js');

let totalOrdersHTML = document.querySelector('#totalOrders');
let orderCompletedHTML = document.querySelector('#orderCompleted');
let ordersPendingHTML = document.querySelector('#ordersPending');
let totalCartHTML = document.querySelector('#totaCart');
let ordersSummeryHTML = document.querySelector('#orders-summery');

let totalOrders = 0;
let ordersCompleted = 0;
let ordersPending = 0;
let totalCart = 0;

let USER_ID = checkUser;
console.log(USER_ID);

let USER_DETAILS;
let userRef = db.collection('Customers').doc(USER_ID);

userRef.onSnapshot(userDoc => {
  let userData = userDoc.data();
  totalOrders = userData.orders.length;
  totalCart = userData.cart.length;

  let row = '';
  userData.orders.map(order => {
    let oId = '';
    if(order.status === 'success') {
      ordersPending++;
      oId = order.successOrderId;
    } else if(order.status === 'completed') {
      ordersCompleted++;
      oId = order.successOrderId;
    } else {
      oId = order.orderId;
    }
    row += `
    <tr>
      <td>${oId}</td>
      <td>${order.type.charAt(0).toUpperCase() + order.type.slice(1)}</td>
      <td>₹${order.totalCost}</td>
      <td>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td>
    </tr>
    `;
  })
  ordersSummeryHTML.innerHTML = row;
  totalOrdersHTML.innerHTML = totalOrders;
  totalCartHTML.innerHTML = totalCart;
  ordersPendingHTML.innerHTML = ordersPending;
  orderCompletedHTML.innerHTML = ordersCompleted;
})