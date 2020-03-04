import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader/root';

/* Import Components */
import DrupalProjectStats from './components/DrupalProjectStats';
import NodeListOnly from "./components/NodeListOnly";
import NodeReadWrite from "./components/NodeReadWrite";

const Main = hot(() => (
  <>
    {
      //<DrupalProjectStats projectName="drupal" />
    }
    {
      //<NodeListOnly />
    }
    {
      <NodeReadWrite/>
    }
  </>
));

ReactDOM.render(<Main/>, document.getElementById('react-app'));
