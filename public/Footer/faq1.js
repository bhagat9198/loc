console.log("about.js");

const db = firebase.firestore();
const storageService = firebase.storage();
let IMAGE;
const faqFormHTML = document.querySelector("#faqForm");

let allFaqs = [];
let faqRef = db.collection("footer").doc("faqs");

const faqForm = (e) => {
  e.preventDefault();
  console.log(faqFormHTML["question-text"]);
  let question = faqFormHTML["question-text"].value;
  let answer = faqFormHTML["answer-text"].value;
  let data;

  data = {
    question: question,
    answer: answer,
    id: new Date().valueOf(),
  };

  const submitData = async (submitData) => {
    allFaqs.push(submitData);
    if (submitData.question && submitData.answer) {
      await faqRef.update("faqs", allFaqs);
    }
    return;
  };
  submitData(data).then(async () => {
    if (IMAGE) {
      await storageService.ref(`footer/faqs/${IMAGE.name}`).put(IMAGE);
      let imgUrl;
      await storageService
        .ref(`footer/faqs/${IMAGE.name}`)
        .getDownloadURL()
        .then((url) => (imgUrl = url))
        .catch((error) => console.log(error));
      console.log(imgUrl);
      faqRef.get().then(async (doc) => {
        let docData = doc.data();
        console.log(docData);
        console.log(docData.imgUrl);
        storageService
          .ref(`footer/faqs/${docData.img}`)
          .delete()
          .then( async() => {
        docData.imgUrl = imgUrl;
        docData.img = IMAGE.name;
        console.log(docData);
        IMAGE = null;
        await faqRef.update(docData);
        // })
        // .then((savedData) => {
        console.log("updated");
        faqFormHTML.reset();
        extractData();
        })
        .catch((error) => {
          console.log(error);
        });
      });
    } else {
      faqFormHTML.reset();
      extractData();
    }
  });
};

faqFormHTML.addEventListener("submit", faqForm);

const sliderFileHTML = document.querySelector("#slider-file");
const uploadFile = (e) => {
  IMAGE = e.target.files[0];
  console.log(IMAGE);
};
sliderFileHTML.addEventListener("change", uploadFile);

const extractData = () => {
  db.collection("footer")
    .doc("faqs")
    .get()
    .then((aboutSnap) => {
      let aboutSnapData = aboutSnap.data();
      setTimeout(() => {
        allFaqs = [];
        allFaqs = aboutSnapData.faqs;
        document.querySelector("#img-preview").src = aboutSnapData.imgUrl;
        document.querySelector("#submitFaq").disabled = false;
        displayFaqs();
      }, 1000);
    });
};
extractData();

const allFaqsHTML = document.querySelector('#all-faqs');
const displayFaqs = () => {
  let card = '';
  allFaqs.map((faq, index) => {
    card += `
    <div class="card">
      <div class="card-header" id="headingOne" style="display: flex;">
        <h2 class="mb-0" style="flex: 1;">
          <button class="btn btn-link" type="button" >
            ${faq.question}
          </button>
        </h2>
        <i class="fa fa-trash" style=" font-size: x-large;margin-top: 10px; cursor: pointer;" data-index="${index}" data-id="${faq.id}" onclick="deleteFaq(event)"></i>
      </div>
  
      <div id="${faq.id}" class="collapse show" >
        <div class="card-body" style="margin: 20px">
          ${faq.answer}
        </div>
      </div>
    </div>
    `;
  });
  allFaqsHTML.innerHTML = card;
}


const deleteFaq = e => {
  let id = e.target.dataset.id;
  let index = e.target.dataset.index;
  console.log(id, index);
  console.log(allFaqs.length);
  allFaqs.splice(index, 1);
  console.log(allFaqs.length);
  faqRef.update('faqs', allFaqs);
  extractData();
}

