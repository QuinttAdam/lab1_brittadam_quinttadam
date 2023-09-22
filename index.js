import { HfInference } from "https://cdn.jsdelivr.net/npm/@huggingface/inference@2.6.1/+esm";

// insert huggingface token here (don't publish this to github)
const HF_ACCESS_TOKEN = "";
const inference = new HfInference(HF_ACCESS_TOKEN);

const audio = document.querySelector("#audio");

// initialize Speechrecognition for webkit bowsers, prefix
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent =
  window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

// grammer -> these are all commands you can say, feel free to change
const commands = ["start", "stop"];
const emotionToSmiley = {
  blij: "blij.jpg",
  verdrietig: "verdrietig.jpg",
  boos: "boos.jpg",
  // Add more emotions and corresponding image URLs as needed
};

const grammar = `#JSGF V1.0; grammar commands; public <command> = ${commands.join(
  " | "
)};`;

document.querySelector("#loading").style.display = "none";

// just speech recognition settings, standard MDN documentation stuff
const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = "nl-NL";
recognition.interimResults = false;

// start listinging
recognition.start();

// on result, log result
recognition.onresult = function (event) {
  // log the word
  let recognizedSpeech = event.results[event.results.length - 1][0].transcript;

  if (recognizedSpeech === "") return;

  // trim word and lowercase
  recognizedSpeech = recognizedSpeech.trim().toLowerCase();

  // update DOM
  document.querySelector("#commando").innerHTML = recognizedSpeech;
};

// the function that makes images
const makeImage = async (prompt) => {
  // showLoading();
  let result = await inference.textToImage({
    inputs: `${prompt}`,
    model: "stabilityai/stable-diffusion-2",
    parameters: {
      negative_prompt: "blurry"
    }
  });
  document.querySelector("#hf").src = URL.createObjectURL(result);
  // hideLoading();
};

makeImage(
  "foto van een laptop geschilderd door Vincent Van Gogh, laptop in de voorgrond, met een hond erop, in een bos, met een zonsondergang"
);

recognition.onresult = function (event) {
  let recognizedSpeech = event.results[event.results.length - 1][0].transcript;
  if (recognizedSpeech === "") return;

  recognizedSpeech = recognizedSpeech.trim().toLowerCase();

  // Check for specific emotions and display corresponding smiley images
  for (const emotion in emotionToSmiley) {
    if (recognizedSpeech.includes(emotion)) {
      // Display the corresponding smiley image on the screen
      displaySmiley(emotionToSmiley[emotion]);
    }
  }

  document.querySelector("#commando").innerHTML = recognizedSpeech;
};
function displaySmiley(smileyImageUrl) {
  const smileyImageElement = document.createElement("img");
  smileyImageElement.src = smileyImageUrl;
  // Add the image element to the DOM where you want to display it
  document.querySelector("#emotions").appendChild(smileyImageElement);
}
