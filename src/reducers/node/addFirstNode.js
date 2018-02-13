import { createNode } from "../helpers/createInitialState";
import { EditorState, ContentState, convertFromHTML } from "draft-js";

export const addFirstNode = state => {
  const graphWidth = document.getElementById("graph").clientWidth;
  const width = 180;
  const height = 120;
  const x = Math.round((graphWidth - width) / 2);
  const y = graphWidth <= 520 ? 80 : 50;
  const node = createNode(x, y, width, height, false);

  const blocksFromHTML = convertFromHTML(
    "Click Me and Press<br/><b>Shift</b> + <b>Arrow</b> Keys"
  );
  const contentState = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );
  node.editorState = EditorState.createWithContent(contentState);

  return { ...state, nodes: [node] };
};
