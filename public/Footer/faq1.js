console.log("faq1.js");

const db = firebase.firestore();
const storageService = firebase.storage();

const heroImgHTML = document.querySelector('#heroImg');
const aboutNoteHTML = document.querySelector('#faq-note');

db.collection('footer').doc('faqs').onSnapshot(doc => {
  let docData = doc.data();
  console.log(docData);
  heroImgHTML.style.backgroundImage  = `url(${docData.imgUrl})`;
  
  let card = '';
  for(let faq of docData.faqs) {
    card += `
    <div class="">
      <div class="card-header">
        <h2 class="mb-0">
          <button class="btn" type="button" data-toggle="collapse" data-target="${faq.id}" aria-expanded="true" aria-controls="${faq.id}">
             <b style="color:red;">${faq.question}</b>
          </button>
        </h2>
      </div>
  
      <div id="${faq.id}" class="collapse show" aria-labelledby="headingOne" data-parent="#faq-note">
        <div class="card-body">
          ${faq.answer}
        </div>
      </div>
    </div>
    `;
    aboutNoteHTML.innerHTML = card;
  }
  
})