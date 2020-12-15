console.log("account1.js");
const db = firebase.firestore();

let ALL_ORDERS = [];
const orderTableBodyHTML = document.querySelector("#order-table-body");
const displayOrder = (data, counter) => {
  let prodsNameArr = [],
    prodsName = "";
  let prodQtysArr = [],
    prodQtys = "";
  let discount = "";

  data.order.products.map((p) => {
    prodsNameArr.push(p.name);
    prodsName += `
    <tr>
      <td>${p.name}</td>
    </tr>
    `;
    prodQtysArr.push(+p.qty);
    prodQtys += `
    <tr>
      <td>${p.qty}</td>
    </tr>
    `;
  });

  let grossAmtArr = [],
    grossAmt = "",
    discountPrice = "",
    taxableValue = "",
    taxableValueArr = [],
    cgstArr = [],
    cgstAmtArr = [],
    cgstAmt = "",
    cgstPercent = "",
    sgstAmt = "";
  let sgstPercent = "",
    eachProdTotalArr = [],
    eachProdTotal = "",
    totalGrossPrice = 0,
    totalQty = 0,
    totalHalfGST = 0,
    totalAllProds = 0,
    totalAllDiscount = 0,
    totalAllTaxableValue = 0,
    addonsCost = 0,
    deliveryCost = 0;

  let allTaxValue = 0,
    allCgstValue = 0,
    allTotalValue = 0,
    allGrossValue = 0,
    allDiscountValue = 0;

  data.basicPrice.map((bp, index) => {
    grossAmtArr.push(+bp);
    totalQty += +prodQtysArr[index];
    totalGrossPrice += grossAmtArr[index];
    grossAmt += `
    <tr>
      <td>${grossAmtArr[index].toFixed(2)}</td>
    </tr>
    `;

    if (data.disPercentArr.length > 0) {
      discount += `
      <tr>
        <td>${data.disPercentArr[index]}</td>
      </tr>
      `;
    } else {
      discount += `
    <tr>
      <td>0%</td>
    </tr>
    `;
    }

    if (data.disArr.length > 0) {
      totalAllDiscount += +data.disArr[index];
      taxableValueArr.push(grossAmtArr[index] - data.disArr[index]);
      discountPrice += `
      <tr>
        <td>${data.disArr[index].toFixed(2)}</td>
      </tr>
      `;
    } else {
      taxableValueArr.push(grossAmtArr[index] - 0);
      discountPrice += `
    <tr>
      <td>0.00</td>
    </tr>
    `;
    }

    totalAllTaxableValue += taxableValueArr[index];
    taxableValue += `
    <tr>
      <td>${taxableValueArr[index].toFixed(2)}</td>
    </tr>
    `;
    if (+data.gstPercentArr[index] > 0) {
      cgstArr.push(+data.gstPercentArr[index] / 2);
      cgstAmtArr.push(+data.gstArr[index] / 2);
    } else {
      cgstArr.push(+data.gstPercentArr[index]);
      cgstAmtArr.push(+data.gstArr[index] / 2);
    }

    cgstPercent += `
    <tr>
      <td>${cgstArr[index]}%</td>
    </tr>
    `;
    cgstAmt += `
    <tr>
      <td>${cgstAmtArr[index].toFixed(2)}</td>
    </tr>
    `;
    totalHalfGST += cgstAmtArr[index];
    sgstPercent += `
    <tr>
      <td>${cgstArr[index]}%</td>
    </tr>
    `;
    sgstAmt += `
    <tr>
      <td>${cgstAmtArr[index].toFixed(2)}</td>
    </tr>
    `;

    eachProdTotalArr.push(+taxableValueArr[index] + +data.gstArr[index]);
    eachProdTotal += `
    <tr>
      <td>${eachProdTotalArr[index].toFixed(2)}</td>
    </tr>
    `;
    totalAllProds += eachProdTotalArr[index];
  });

  allGrossValue += totalGrossPrice;
  allDiscountValue += totalAllDiscount;
  allTaxValue += totalAllTaxableValue;
  allCgstValue += totalHalfGST;
  allTotalValue += totalAllProds;

  let addonsNames = "",
    adddonsQty = "",
    addonsGrossAmt = "",
    addondDiscountPercent = "",
    addondDiscount = "",
    addonsTaxableValue = "",
    addonsCgstPercent = "",
    addonsCgst = "",
    addonTotal = "";

  data.order.addons.map((add) => {
    // console.log(add);
    addonsNames += `
    <tr>
      <td>${add.name}</td>
    </tr>
    `;
    adddonsQty += `
    <tr>
      <td>${add.qty}</td>
    </tr>
    `;
    addonsGrossAmt += `
    <tr style="text-align: right;">
      <td>${(+add.basicPrice * +add.qty).toFixed(2)}</td>
    </tr>
    `;
    addondDiscountPercent += `
    <tr>
      <td>${0}%</td>
    </tr>
    `;
    addondDiscount += `
    <tr>
      <td>0.00</td>
    </tr>
    `;
    addonsTaxableValue += `
    <tr>
      <td>${(+add.basicPrice * +add.qty).toFixed(2)}</td>
    </tr>
    `;
    let aCgst = 0,
      aCgstPrice = 0;
    aCgst = +add.gst / 2;
    aCgstPrice =( +add.basicPrice * (aCgst / 100)) * +add.qty;

    addonsCgstPercent += `
    <tr>
      <td>${aCgst}%</td>
    </tr>
    `;

    addonsCgst += `
    <tr>
      <td>${aCgstPrice.toFixed(2)}</td>
    </tr>
    `;

    let aTotal = 0;
    aTotal = ((+add.basicPrice * (aCgst / 100) * add.qty )* 2) + (+add.basicPrice * +add.qty);
    addonTotal += `
    <tr style="text-align: right;">
      <td>${aTotal.toFixed(2)}</td>
    </tr>
    `;

    allGrossValue += +add.basicPrice * +add.qty;
    allTaxValue += +add.basicPrice * +add.qty;
    allCgstValue += aCgstPrice;
    allTotalValue += aTotal;
  });

  deliveryCost = +data.shipeTypePrice;
  let deliveryGrossAmt = `
  <tr>
    <td>${deliveryCost.toFixed(2)}</td>
  </tr>`;
  let deliveryDisPercent = `
  <tr>
    <td>${0}%</td>
  </tr>
  `;
  let deliveryDisAmt = `
  <tr>
    <td>${0.0}</td>
  </tr>
  `;
  let deliveryTaxableValue = `
  <tr>
    <td>${deliveryCost.toFixed(2)}</td>
  </tr>
  `;
  let deliveryCgstPercent = `
  <tr>
    <td>${0}%</td>
  </tr>
  `;
  let deliveryCgst = `
  <tr>
    <td>${0}.00</td>
  </tr>
  `;
  let deliveryTotal = `
  <tr >
    <td>${deliveryCost.toFixed(2)}</td>
  </tr>
  `;

  allGrossValue += deliveryCost;
  allTaxValue += deliveryCost;
  allTotalValue += deliveryCost;

  let tr = `
  <tr class="main-tr">
    <th scope="row">${counter + 1}<br><br> ${data.orderAt.split(',')[0]}<br> ${data.orderAt.split(',')[1]} </th>
    <td>
      <table class="table-un-striped">
        <tbody style="border-bottom: 1px solid gray">
          ${prodsName}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td>Sub Total</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addonsNames}
                </tbody>
              </table>
            </td>
          </tr>
          <tr><td>Delivery</td></tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td><b>TOTAL</b><td>
          </tr>
          <tr>
            <td></td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${prodQtys}
        </tbody>
      </table>
      <table >
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td>${totalQty}</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${adddonsQty}
                </tbody>
              </table>
            </td>
          </tr>
          <tr><td><span  style="visibility: hidden;"> ---</span></td></tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td><td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${grossAmt}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td>${totalGrossPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right; margin-right: 0; padding-right: 0;">
              <table>
                <tbody style="text-align: right; margin-right: 0; padding-right: 0;">
                  ${addonsGrossAmt}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryGrossAmt}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td>${allGrossValue.toFixed(2)}<td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${discount}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td style="visibility: hidden;">---</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addondDiscountPercent}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryDisPercent}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td><td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${discountPrice}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td>${totalAllDiscount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addondDiscount}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryDisAmt}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td>${allDiscountValue.toFixed(2)}<td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${taxableValue}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td>${totalAllTaxableValue.toFixed(2)}</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addonsTaxableValue}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryTaxableValue}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td>${allTaxValue.toFixed(2)}<td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${cgstPercent}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td style="visibility: hidden;">---</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addonsCgstPercent}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryCgstPercent}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td><td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${cgstAmt}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td>${totalHalfGST.toFixed(2)}</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addonsCgst}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryCgst}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td>${allCgstValue.toFixed(2)}<td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${sgstPercent}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td style="visibility: hidden;">---</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addonsCgstPercent}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryCgstPercent}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td><td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${sgstAmt}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td>${totalHalfGST.toFixed(2)}</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addonsCgst}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryCgst}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td>${allCgstValue.toFixed(2)}<td>
          </tr>
        </tbody>
      </table>
    </td>
    <td style="text-align: right;">
      <table>
        <tbody style="border-bottom: 1px solid gray;">
          ${eachProdTotal}
        </tbody>
      </table>
      <table>
        <tbody style="border-bottom: 1px double gray;">
          <tr>
            <td>${totalAllProds.toFixed(2)}</td>
          </tr>
          <tr>
            <td>
              <table>
                <tbody>
                  ${addonTotal}
                </tbody>
              </table>
            </td>
          </tr>
          ${deliveryTotal}
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td>${(Math.round(allTotalValue)).toFixed(2)}<td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
  
  
  `;
  return tr;
};

const displayOrders = () => {
  let row = "";
  let counter = 0;
  for (let order of ALL_ORDERS) {
    row += displayOrder(order, counter);
    counter++;
  }
  // console.log(row);
  orderTableBodyHTML.innerHTML = row;
};

const sortOrders = async() => {
  console.log(ALL_ORDERS);
  ALL_ORDERS.sort((a,b) => {
    console.log(a);
    let d1 = a.timeStamp;
    let d2 = b.timeStamp;
    // console.log(d1, d2);
    return d2 - d1;
  })
}


db.collection("orders").get().then(async(snaps) => {
  let sanpsDocs = snaps.docs;

  for (let doc of sanpsDocs) {
    let data = doc.data();
    console.log(data);
    ALL_ORDERS.push(data);
  }
  
  await sortOrders();

  displayOrders();
});
