console.log("customerProfile1.js");

let totalOrdersHTML = document.querySelector("#totalOrders");
let orderCompletedHTML = document.querySelector("#orderCompleted");
let ordersPendingHTML = document.querySelector("#ordersPending");
let totalCartHTML = document.querySelector("#totaCart");
let ordersSummeryHTML = document.querySelector("#orders-summery");

let totalOrders = 0;
let ordersCompleted = 0;
let ordersPending = 0;
let totalCart = 0;

db.collection("miscellaneous")
  .doc("siteStatus")
  .onSnapshot((siteDoc) => {
    let siteData = siteDoc.data();
    
    if (!siteData.status) {
      document.querySelector("#top-alert").innerHTML = `
    <section class="top-header top-nav" style="background: red; display: flex; justify-content: center; text-align: center;">
    <b style="color: white"> ${siteData.note} <b>    
    </section>
    `;
    } else {
      document.querySelector("#top-alert").innerHTML = `
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
  });

let USER_ID = checkUser;

let ALL_ORDERS = [];
let USER_DETAILS;
let userRef = db.collection("Customers").doc(USER_ID);

userRef.onSnapshot(async (userDoc) => {
  let userData = userDoc.data();

  var imageRow = "";

  if (userData.cart) {
   
    if(userData.cart.length==undefined){
      var totalCart = 0;
    }else{
      var totalCart = userData.cart.length;
    }
   
  }else{
    var totalCart = 0;
  }

  if (userData.orders ) {

    

    let row = "";
    let i = 0;
    let orderLength=0;
    await userData.orders.map(async (order, orderIndex) => {
      ALL_ORDERS.push(order);
      i++;
      let oId = "";

      // await order.addons.map(async data =>{
      //   var docRef =await db.collection(data.cat).doc(data.prodId).get().then(function(doc){
      //     if(doc.data().mainImgUrl){

      //       imageRow+=`

      //       `

      //     }

      //   })

      // });

      if (order.status === "success") {
        ordersPending++;
        oId = order.successOrderId;
      } else if (order.status === "completed") {
        ordersCompleted++;
        oId = order.successOrderId;
      } else {
        var imgData;
        oId = order.orderId;
      }
      
      if(order.status.charAt(0).toUpperCase() + order.status.slice(1)=="Success"){
      orderLength++;
   
      row += `
    <tr>
      <td>${oId}</td>
      <td><label  class="btn btn-sm btn-default "
      style="display: inline-block;background-color: green;color: #ffffff;" onclick="orderModal(event,this)" data-oid=${orderIndex}>View Order</label></td>
      <td>₹${order.totalCost}</td>
      <td>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td>
    </tr>
    


    `
    };

      // document.getElementById("imageDisp"+oId).innerHTML="gg"
    });
    ordersSummeryHTML.innerHTML = row;
    var totalOrders = orderLength;
    totalOrdersHTML.innerHTML = totalOrders;
  }

  totalCartHTML.innerHTML = totalCart;
  ordersPendingHTML.innerHTML = ordersPending;
  orderCompletedHTML.innerHTML = ordersCompleted;
});
const orderModal = async (e, current) => {
  let index = e.target.dataset.oid;
  let productData = "";
  // await ALL_ORDERS[index].products.forEach(async (element) => {
  for (let i = 0; i < ALL_ORDERS[index].products.length; i++) {
    await db
      .collection(ALL_ORDERS[index].products[i].cat)
      .doc(ALL_ORDERS[index].products[i].prodId)
      .get()
      .then(function (doc) {
        let docData = doc.data();
        productData += `
      <div class="row">
      <div class="col-lg-12">
        <div class="row">
          <div class="col-xs-6"> 
            <img class="img-fluid" style="width:100px;height:100px;object-fit:cover" src="${docData.mainImgUrl}">
          </div>
          <div class="col-xs-6" style="padding-top: 2vh;">
            <ul type="none">
                <li>Name- ${docData.name} </li>
                <li>Sno- ${docData.sno}</li>
            </ul>
          </div>
        </div>
      `;
        
      });
  }

  for (let i = 0; i < ALL_ORDERS[index].addons.length; i++) {
    await db
      .collection('addons')
      .doc(ALL_ORDERS[index].addons[i].id)
      .get()
      .then(function (doc) {
        let docData = doc.data();
        productData += `
      <div class="row">
      <div class="col-lg-12">
        <div class="row">
          <div class="col-xs-6"> 
            <img class="img-fluid" style="width:100px;height:100px;object-fit:cover" src="${docData.imgUrl}">
          </div>
          <div class="col-xs-6" style="padding-top: 2vh;font-size:12px !important">
            <ul type="none" style="">
                <li style="font-size:12px !important">Name- ${docData.name} </li>
                <li style="font-size:12px !important">Sno- ${docData.sno}</li>
            </ul>
          </div>
        </div>
      `;
       
      });
  }
  // });

  let orderTime=ALL_ORDERS[index].orginTimeStamp;
 
  if(orderTime.toString().startsWith("Timestamp")){
    orderTime=ALL_ORDERS[index].orginTimeStamp.toDate().toString().substring(0,15);
  }else{
   orderTime=ALL_ORDERS[index].orginTimeStamp.toString().substring(0,10)
  }
  
  let modalPopup = `
  
  <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header">
              <h4 class="modal-title">Order Details Of - ${ALL_ORDERS[index].successOrderId?ALL_ORDERS[index].successOrderId:ALL_ORDERS[index].orderId} </h4> <button type="button" class="close" data-dismiss="modal">&times;</button>
          </div> <!-- Modal body -->
          <div class="modal-body">
              <div class="container">
                <h6>Item Details</h6>
                 
                ${productData}
                   
                  </div>
                </div>
            
                  <hr>
                  <h6 style="font-weight:800">Order Details</h6>
                  <div class="row" style="margin:auto !important">
                      <div class="col-xs-6">
                          <ul type="none" class="displayOrder">
                              <li class="left">Order number:</li>
                              <li class="left">Order Date:</li>
                        
                              <li class="left">Shipping:</li>
                              <li class="left">Total Price:</li>
                          </ul>
                      </div>
                      <div class="col-xs-6">
                          <ul class="right displayOrder" type="none" style="margin:auto" >
                              <li class="right">${ALL_ORDERS[index].successOrderId?ALL_ORDERS[index].successOrderId:ALL_ORDERS[index].orderId}</li>
                              <li class="right"></li>${orderTime}
                      
                              <li class="right">${ALL_ORDERS[index].success?ALL_ORDERS[index].success.type:"NA"}</li>
                              <li class="right">${ALL_ORDERS[index].totalCost}</li>
                          </ul>
                      </div>
                  </div>
                  <hr>
                  <h6>Shipment</h6>
                  <div class="row" style="border-bottom: none;margin:auto">
                      <div class="col-xs-6">
                          <ul type="none">
                              <li class="left">Deliver By</li>
                          </ul>
                      </div>
                      <div class="col-xs-6" style="margin:auto !important">
                          <ul type="none">
                              <li class="right">${ALL_ORDERS[index].success?ALL_ORDERS[index].success.date:"Not Orderd"}</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div> <!-- Modal footer -->
         
      </div>
  </div>
</div>

  `;

  document.querySelector("#modal1").innerHTML = "";
  document.querySelector("#modal1").innerHTML = modalPopup;
  $("#modal1").modal("show");
};
