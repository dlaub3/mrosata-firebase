import R from "ramda";
import "./styles/main.scss";
import dom, { renderDOM } from "utils/dom";
import compose from "utils/compose";
import { createStore } from "./data/redux-ish";
import Slideshow from "./components/Slideshow";
import Controls from "./components/Controls";
import mainReducer from "./data/reducers";
import middleware from "./utils/firebase-middleware";
// import middleware from "./utils/action-history-middleware";
import slides from "./data/slides";
import { getOrElse, toMaybe } from "utils/maybe";

// initialState :: Object
const initialState = {
  title: "",
  presentation: {
    slides: [],
    slidePos: [0, 0]
  },
  settings: {
    fullscreen: true
  }
};

const { getState, dispatch, subscribe } = createStore(
  mainReducer,
  initialState,
  middleware
);

const update = renderDOM(
  state => {
    const {
      title = "",
      presentation: { slides, slidePos },
      settings
    } = state;
    return (
      <div>
        <h1>{title}</h1>
        <Slideshow slides={slides} settings={settings} />
        <Controls {...state} dispatch={dispatch} />
      </div>
    );
  },
  document.getElementById("packtPubApp"),
  initialState
);

subscribe(() => {
  update(getState(), dispatch);
});

const getItem = localStorage.getItem.bind(localStorage);
const fromLocalStore = R.compose(
  toMaybe,
  JSON.parse,
  getItem
);

dispatch({ type: "CUSTOM_TITLE", value: "Packt Presentation App" });
dispatch({
  type: "SETUP_SLIDES",
  value: getOrElse(slides, fromLocalStore("slides"))
});

dispatch({
  type: "REMOTE_FB_SLIDES",
  firebase: {
    ref: "slides",
    mothod: "value"
  }
});
