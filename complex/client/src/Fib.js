import React, {Component} from "react"
import axios from "axios"

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({values: values.data})
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({seenIndexes: seenIndexes.data})
  }

  // need to be bound - use array function
  handleSubmit = async (ev) => {
    ev.preventDefault();

    await axios.post('/api/values', {
      index: this.state.index
    })
    this.setState({index: ''})
  }

  renderSeenIndexes() {
    return this.state.seenIndexes.map(({number}) => {
      return number;
    })
      .join(', ')
  }

  renderValues() {
    const entries = [];

    for(let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      )
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index</label>
          <input
            value={this.state.index}
            onChange={ev => this.setState({index: ev.target.value})}
          />
          <button>Submit</button>
        </form>

        <h3>Indicies I have seen</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated values</h3> 
        {this.renderValues()}
      </div>
    )
  }
}

export default Fib;