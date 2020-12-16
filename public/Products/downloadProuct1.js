console.log("downloadProduct1.js");
const db = firebase.firestore();
const storageService = firebase.storage();

const tableHeaderHTML = document.querySelector("#table-header");
const tableBodyHTML = document.querySelector("#table-body");

let CAT_ID;
let CAKE = false;
const getParams = async (url) => {
  var params = {};
  var parser = document.createElement("a");
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split("&&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};

let dbRef;
let ALL_PRODS = [];
let ALL_CAT = [];
let cName;

getParams(window.location.href).then(async (response) => {
  CAT_ID = response.cat;
  console.log(CAT_ID);
  db.collection('categories').get().then(catSnaps => {
    let catDocs = catSnaps.docs;
    for(let c of catDocs) {
      let cData = c.data();
      if(c.id === CAT_ID) {
        cName = cData.name;
      }
      ALL_CAT.push({id: c.id, data: cData});
    }
  })

  dbRef = await db.collection(CAT_ID);
  await dbRef.get().then((snaps) => {
    let snapsDocs = snaps.docs;

    for (let doc of snapsDocs) {
      let docData = doc.data();
      let cat, subCat, childCat;
      for(let c of ALL_CAT) {
        if(c.id === docData.wholeCategory.split('__')[0]) {
          cat = c.data.name;
          console.log(cat);
          console.log(c);
          for(let sc of c.data.subCategory) {
            console.log(sc);
            console.log(sc.id, docData.wholeSubCategory.split('__')[1]);
            if(sc.id === +docData.wholeSubCategory.split('__')[1]) {
            
              subCat = sc.name;
              console.log(sc);
              for(let cc of sc.childCategories) {
                if(cc.id === +docData.wholeChildCategory.split('__')[2]) {
                  childCat = cc.name;
                }
              }
            }
          }
        } 
      }

      let data;
      data = {
        sno: docData.sno,
        name: docData.name,
        img: docData.mainImgUrl,
        cat: cat,
        subCat: subCat,
        childCat: childCat
      };
      if (docData.isCake) {
        CAKE = true;
        data.weights = docData.weights;
      } else {
        data.price = docData.totalPrice;
      }
      ALL_PRODS.push(data);
    }
  });
  displayTableHeader();
  displayTableBody();
});

const displayTableHeader = () => {
  let th;
  if (CAKE) {
    th = `
  <tr>
    <th scope="col">#</th>
    <th class="pname" scope="col">Name</th>
    <th scope="col">Category</th>
    <th scope="col">Image</th>
    <th scope="col">Weight-Price</th>
  </tr>
  `;
  } else {
    th = `
  <tr>
    <th scope="col">#</th>
    <th scope="col">Name</th>
    <th scope="col">Category</th>
    <th scope="col">Image</th>
    <th scope="col">Price</th>
  </tr>
  `;
  }
  tableHeaderHTML.innerHTML = th;
};

const displayTableBody = () => {
  let row = "";
  if (CAKE) {
    let counter = 0;
    for (let p of ALL_PRODS) {
      counter++;
      let weightsPrices = "";
      p.weights.map((w) => {
        let weightNum;
        let weightPrice;
        if (w.cakeWeight === "half") {
          weightNum = `1/2 KG`;
          weightPrice = w.weightPrice;
        } else if (w.cakeWeight === "one") {
          weightNum = `1 KG`;
          weightPrice = w.weightPrice;
        } else if (w.cakeWeight === "oneHalf") {
          weightNum = `1.5 KG`;
          weightPrice = w.weightPrice;
        } else if (w.cakeWeight === "two") {
          weightNum = `2 KG`;
          weightPrice = w.weightPrice;
        } else if (w.cakeWeight === "three") {
          weightNum = `3 KG`;
          weightPrice = w.weightPrice;
        } else if (w.cakeWeight === "four") {
          weightNum = `4 KG`;
          weightPrice = w.weightPrice;
        } else if (w.cakeWeight === "five") {
          weightNum = `5 KG`;
          weightPrice = w.weightPrice;
        } else if (w.cakeWeight === "six") {
          weightNum = `6 KG`;
          weightPrice = w.weightPrice;
        } else {
          weightNum = 0;
        }
        weightsPrices += `
        <div style="display: flex">
          <span class="label">${weightNum}</span> <span class="divider">:</span> <span class="info"> ₹ ${weightPrice}</span>
        </div>
        `;
      });
      row += `
      <tr scope="row" class="each-row">
        <th>#${counter}</th>
        <td>${p.name} <br> ${p.sno}</td>
        <td>${p.cat} <br> ${p.subCat} <br> ${p.childCat}</td>
        <td><img class="prodImg" src="${p.img}"></td>
        <td>${weightsPrices}</td>
      </tr>
      `;
    }
    tableBodyHTML.innerHTML = row;
  } else {
    let counter = 0;
    for (let p of ALL_PRODS) {
      counter++;
      row += `
      <tr scope="row" class="each-row">
        <th>#${counter}</th>
        <td>${p.name} <br> ${p.sno}</td>
        <td>${p.cat} <br> ${p.subCat} <br> ${p.childCat}</td>
        <td><img class="prodImg" src="${p.img}"></td>
        <td>₹ ${p.price}</td>
      </tr>
      `;
    }
    tableBodyHTML.innerHTML = row;
  }
};
