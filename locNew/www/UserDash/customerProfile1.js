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

db.collection('miscellaneous').doc('siteStatus').onSnapshot(siteDoc => {
  let siteData = siteDoc.data();
  console.log(siteData);
  if(!siteData.status) {
    document.querySelector('#top-alert').innerHTML = `
    <section class="top-header top-nav" style="background: red; display: flex; justify-content: center; text-align: center;">
    <b style="color: white"> ${siteData.note} <b>    
    </section>
    `;
  } else {
    document.querySelector('#top-alert').innerHTML = `
    <section class="top-header top-nav" style="background: #f1f1f1;">
        <div class="container-fluid remove-padding topnaves"
          style="background: #f1f1f1;;
      background-size: 617px; background-image: url();height: 28px !important;padding: 0px !important;margin-bottom: 0.3%;">
          <div class="container topcnt">
            <div class="row" style="justify-content: flex-end;">
              <div class="">
                <div class="content">
                  <div class="left-content">
                  </div>
                  <div class="right-content">
                    <div class="list" style="padding: 6px 10px 100px;">
                      <ul style="padding-right: 10px;">
                        <li>
                          <a type="button" data-toggle="modal" data-target="#topoffer" style=" position: relative;">
                            <span class="sign-in" data-toggle="modal" data-target="#modalYT"
                              style="font-size: 14px; color: rgb(10, 10, 10);">
                              <i style="color: red !important;" class="fa fa-gift" aria-hidden="true"></i> OFFER</span>
                          </a>
                        </li> &nbsp; |

                        <li><a href="#" class="track-btn"><span class="sign-in" style="font-size: 14px; color: #000;"><i
                                class="fa fa-gift" aria-hidden="true" style="color: red;"></i>
                              COUPONS</span> </a>
                        </li> &nbsp; |
                        <li><a href="tel:9598891097" class="track-btn"><span class="sign-in"
                              style="font-size: 14px; color: #000;"><i class="fa fa-phone" aria-hidden="true"
                                style="color: red;"></i>
                              9598891097</span> </a>
                        </li> &nbsp; |
                        <li><a href="mailto:lakeofcakess@gmail.com" class="track-btn"><span class="sign-in"
                              style="font-size: 14px; color: #000;"><i class="fa fa-envelope" aria-hidden="true"
                                style="color: red;"></i>
                              Email</span> </a>
                        </li> &nbsp;
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
})

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