console.log('siteStaus.js');

const db = firebase.firestore();
const siteStatusSwitcherHTML = document.querySelector('#siteStatusSwitcher');

let dbRef = db.collection('miscellaneous').doc('siteStatus');

dbRef.get().then(doc => {
  let docData = doc.data();
  if(docData.status) {
    siteStatusSwitcherHTML.innerHTML = `
    <span class="switcher switcher-1 active">
    <input type="checkbox" id="switcher-1" onchange="changeSiteStaus(event, this)">
    <label for="switcher-1"></label>
    </span>
    `; 
    document.querySelector('#switcher-1').checked = true;
  } else {
    siteStatusSwitcherHTML.innerHTML = `
    <span class="switcher switcher-1 paused">
      <input type="checkbox" id="switcher-1" onchange="changeSiteStaus(event, this)">
      <label for="switcher-1"></label>
    </span>
    `; 
  }
})

const changeSiteStaus = async(e, current) => {
  dbRef.get().then(async(doc) => {
    let docData = doc.data();
    docData.status = !docData.status;
    await dbRef.update(docData)
  })
}

