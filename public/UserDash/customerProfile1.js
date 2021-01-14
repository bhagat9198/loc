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

userRef.onSnapshot(async userDoc => {
  
  let userData = userDoc.data();

  var imageRow='';

  if(userData.cart){
    
    var totalCart = userData.cart.length;
    
  }

  if(userData.orders){
    var totalOrders = userData.orders.length;
  
  
  let row = '';
  let i=0;
 
  await userData.orders.map(async order => {
    i++;
    let oId = '';

    await order.products.map(async data =>{
      var docRef =await db.collection(data.cat).doc(data.prodId).get().then(function(doc){
        if(doc.data().mainImgUrl){
        
          imageRow+=`
         
          `
         
        }
        
      })
     
    });

    if(order.status === 'success') {


      ordersPending++;
      oId = order.successOrderId;
     
    } else if(order.status === 'completed') {
      ordersCompleted++;
      oId = order.successOrderId;
    } else {
     
      var imgData;

      
      oId = order.orderId;
   
    }
    
    row += `
    <tr>
      <td>${oId}</td>
      <td><label  class="btn btn-sm btn-default "
      style="display: inline-block;background-color: green;color: #ffffff;" data-toggle="modal" data-target="#modal1`+i+`">View Order</label></td>
      <td>₹${order.totalCost}</td>
      <td>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</td>
    </tr>
    <div class="modal fade" id="modal1`+i+`">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
                <h4 class="modal-title">${oId}</h4> <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div> <!-- Modal body -->
            <div class="modal-body">
                <div class="container">
                  <h6>Item Details</h6>
                   
                  <div class="row">
                    <div class="col-lg-12">
                      <div class="row">
                        <div class="col-xs-6"> 
                          <img class="img-fluid" style="width:100px;height:100px;object-fit:cover" src="https://i.pinimg.com/originals/ab/67/53/ab6753ec1cef75f1cc2052487b1f4059.jpg">
                        </div>
                        <div class="col-xs-6" style="padding-top: 2vh;">
                          <ul type="none">
                              <li>Name- Cake </li>
                              <li>Sno- LOC23</li>
                          </ul>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-xs-6"> 
                          <img class="img-fluid" style="width:100px;height:100px;object-fit:cover" src="https://i.pinimg.com/originals/ab/67/53/ab6753ec1cef75f1cc2052487b1f4059.jpg">
                        </div>
                        <div class="col-xs-6" style="padding-top: 2vh;">
                          <ul type="none">
                              <li>Name- Cake </li>
                              <li>Sno- LOC23</li>
                          </ul>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-xs-6"> 
                          <img class="img-fluid" style="width:100px;height:100px;object-fit:cover" src="https://i.pinimg.com/originals/ab/67/53/ab6753ec1cef75f1cc2052487b1f4059.jpg">
                        </div>
                        <div class="col-xs-6" style="padding-top: 2vh;">
                          <ul type="none">
                              <li>Name- Cake </li>
                              <li>Sno- LOC23</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
              
                    <hr>
                    <h6>Order Details</h6>
                    <div class="row">
                        <div class="col-xs-6">
                            <ul type="none" class="displayOrder">
                                <li class="left">Order number:</li>
                                <li class="left">Date:</li>
                                <li class="left">Price:</li>
                                <li class="left">Shipping:</li>
                                <li class="left">Total Price:</li>
                            </ul>
                        </div>
                        <div class="col-xs-6">
                            <ul class="right displayOrder" type="none" >
                                <li class="right">#BBRT-3456981</li>
                                <li class="right">19-03-2020</li>
                                <li class="right">$690</li>
                                <li class="right">$30</li>
                                <li class="right">$720</li>
                            </ul>
                        </div>
                    </div>
                    <hr>
                    <h6>Shipment</h6>
                    <div class="row" style="border-bottom: none">
                        <div class="col-xs-6">
                            <ul type="none">
                                <li class="left">Estimated arrival</li>
                            </ul>
                        </div>
                        <div class="col-xs-6">
                            <ul type="none">
                                <li class="right">25-03-2020</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div> <!-- Modal footer -->
           
        </div>
    </div>
</div>
</div>

    `;

    // document.getElementById("imageDisp"+oId).innerHTML="gg"
  })
  ordersSummeryHTML.innerHTML = row;
  
  totalOrdersHTML.innerHTML = totalOrders;
}


  totalCartHTML.innerHTML = totalCart;
  ordersPendingHTML.innerHTML = ordersPending;
  orderCompletedHTML.innerHTML = ordersCompleted;
})