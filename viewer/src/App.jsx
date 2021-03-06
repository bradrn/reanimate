import React, {Component} from 'react';
import './App.css';

class App extends Component {
  connect = () => {
    // const ws = new WebSocket("wss://reanimate.clozecards.com:9160");
    const ws = new WebSocket("ws://localhost:9161");

    ws.onopen = event => {
      this.setState(state => ({
        ...state,
        message: "Connected."
      }));
      ws.send('60');
    }
    ws.onclose = event => {
      this.setState(state => ({
        ...state,
        message: "Disconnected."
      }));
      setTimeout(this.connect, 1000);
    }
    ws.onmessage = event => {
      if (event.data === "Success!") {
        console.log("Success");
      } else if (event.data === "Compiling") {
        this.setState({message: "Compiling..."});
      } else if (event.data === "Rendering") {
        this.setState({message: "Rendering..."});
        this.nFrames_new = 0;
        this.svgs_new = [];
      } else if (event.data === "Done") {
        this.setState({message: ""});
        console.log("Done");
        this.nFrames = this.nFrames_new;
        this.svgs = this.svgs_new;
        this.nFrames_new = 0;
        this.svgs_new = [];
        this.start = Date.now();
      } else if (event.data.startsWith("Error")) {
        console.log("Error");
        this.setState({message: event.data.substring(5)});
      } else {
        this.setState({message: `Rendering: ${this.nFrames_new}`});
        this.nFrames_new++;
        const div = document.createElement('div');
        div.innerHTML = event.data;
        this.svgs_new.push(div);
      }
    }
    this.setState(state => ({
      ...state,
      socket: ws,
      message: "Connecting..."
    }));
  }
  constructor(props) {
    super(props);

    this.state = {
    };
    setTimeout(this.connect, 0);
    this.nFrames_new = 0;
    this.svgs_new = [];
    this.nFrames = 0;
    this.svgs = [];
    this.start = Date.now();
    const self = this;
    const animate = () => {
      const now = Date.now();
      const nFrames = self.nFrames;
      const thisFrame = (Math.round((now - this.start) / 1000 * 60)) % nFrames
      // const thisFrame = 0; console.log('Animation frame:', thisFrame, nFrames);
      if (self.svgs_new.length) {
        while (self.svg.firstChild)
          self.svg.removeChild(self.svg.firstChild);
        self.svg.appendChild(self.svgs_new[self.svgs_new.length-1]);
      } else {
        if (nFrames) {
          // self.svg.innerHTML = self.svgs[thisFrame];
          while (self.svg.firstChild)
            self.svg.removeChild(self.svg.firstChild);
          self.svg.appendChild(self.svgs[thisFrame]);
        } else {
          self.svg.innerText = "";
        }
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
  onLoad = ace => {
    setTimeout(function() {
      ace.resize();
    }, 0);
  }
  render() {
    const {message} = this.state;
    return (
      <div className="App">
        <div className="viewer">
          <div ref={node => this.svg = node}/>
          <div className="messages">
            <pre>{message}</pre>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
