import React from "react";
import NodeForm from "./NodeForm";

const NodeEdit = ({ id, title, body, onSuccess }) => (
  <NodeForm
    id={id}
    title={title}
    body={body}
    onSuccess={onSuccess}
  />
);

export default NodeEdit;
