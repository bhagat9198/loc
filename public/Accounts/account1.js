console.log("account1.js");
const db = firebase.firestore();

let ALL_ORDERS = [];
const orderTableBodyHTML = document.querySelector("#order-table-body");
const displayOrder = (data, counter) => {
  let prodsName = [];
  let prodQtys = [];
  // data.order.products.map(p => {
    // prodsName.push(p.name);
    // prodQtys.push(p.qty)
  // })

  let grossAmt = [];
  // data.basicPrice.map((bp, index) => {
    // grossAmt.push(bp * +prodQtys[index]);
  // })

  
  let tr = `
  <tr class="main-tr">
    <th scope="row">${counter}</th>
    <td>
      <table class="table-un-striped">
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
    <td>
      <table>
        <tbody>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
          <tr>
            <td>sdfghf</td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
  `;
};

const displayOrders = () => {
  let row = 0;
  let counter = 0;
  for (let order of ALL_ORDERS) {
    counter++;
    row += displayOrder(order, counter);
  }
  // orderTableBodyHTML.innerHTML = row;
};

db.collection("orders").onSnapshot((snaps) => {
  let sanpsDocs = snaps.docs;

  for (let doc of sanpsDocs) {
    let data = doc.data();
    console.log(data);
    ALL_ORDERS.push(data);
    displayOrders();
  }
});
