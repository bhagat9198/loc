console.log('addSlider1.js');

const db = firebase.firestore();
const storageService = firebase.storage();

const addSliderFormHTML = document.querySelector("#add-slider-form");
const sliderFileHTML = document.querySelector('#slider-file');
const sliderTbodyHTML = document.querySelector('.slider-tbody');
let sliderImg;

const extractImgURL = async(imgPath) => {
  let imgUrl;
  await storageService.ref(imgPath).getDownloadURL().then(url => {
    imgUrl = url;
  }).catch(error => {
    console.log(error);
  })
  return imgUrl;
}

const displayRows = async(docs) => {
  let tRows = '';
  for(let doc of docs) {
  let docData = doc.data();
  console.log(docData);
  let docId = doc.id;
  let imgUrl = await extractImgURL(`sliders/${docId}/${docData.img}`);
  tRows += `
    <tr role="row" class="odd parent">
      <td tabindex="0">${docData.title}<br></td>
      <td><img src="${imgUrl}"></td>
      <td>
        <div class="action-list">
          <select class="process drop-success" style="display: block;">
            <option selected>Activated</option>
            <option>Deactivated</option>
          </select>
      </td>
      <td>
        <div class="godropdown">
          <button class="go-dropdown-toggle">Actions
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="action-list" style="display: none;">
            <a href="javascript:;" data-toggle="modal" data-target="#confirm-delete"
              class="delete">
              <i class="fas fa-trash-alt"></i>Delete
            </a>
          </div>
        </div>
      </td>
    </tr>`;
  }
  console.log(tRows);
  sliderTbodyHTML.innerHTML = tRows;
}


db.collection('sliders').onSnapshot(snapshot => {
  let snapshotDocs = snapshot.docs;
  displayRows(snapshotDocs);
});

const addSlider = e => {
  e.preventDefault();
  const title = addSliderFormHTML["slider-name"].value;
  const imgName = `${Math.random()}__${sliderImg.name}`;

  const wholdeSliderData = {
    title: title,
    img: imgName
  }

  const addSliderReq = async(data) => {
    let docId;
    await db.collection('sliders').add(data).then(snapshot => {
      docId = snapshot.id;
    });
    return {data: data, docId: docId};
  }
  addSliderReq(wholdeSliderData).then(async(response) => {
    await storageService.ref(`sliders/${response.docId}/${response.data.img}`).put(sliderImg);
    sliderImg = null;
    console.log('done');
  }).catch(error => {
    console.log(error);
  })

}
addSliderFormHTML.addEventListener('submit', addSlider);


sliderFileHTML.addEventListener('change', e => {
  sliderImg = e.target.files[0];
  console.log(sliderImg);
})