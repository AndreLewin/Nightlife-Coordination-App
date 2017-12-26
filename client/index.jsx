import React from 'react';
import ReactDOM from 'react-dom';
import { Form } from 'semantic-ui-react';
import axios from 'axios';

import Auth from './Auth/Auth';
import AuthButton from './components/AuthButton.jsx';
import BusinessList from './components/BusinessList.jsx';

import yelpLogo from '../public/Yelp_trademark_RGB_outline.png';

const auth = new Auth();


class App extends React.Component {
  constructor(props) {
    super(props);

    // Check the authentification hash, and set the result in localStorage
    this.props.auth.handleAuthentication();

    this.state = {
      city: localStorage.getItem("lastSearch"),
      loading: false,
      businesses: [],
      accessToken: localStorage.getItem("accessToken")
    };

    this.handleChange = this.handleChange.bind(this);
    this.search = this.search.bind(this);
    this.handleGoingClick = this.handleGoingClick.bind(this);
  }

  componentDidMount() {
    if (localStorage.getItem("lastSearch")) {
      this.search();
    }
  }

  handleChange(event) {
    this.setState({
      city: $("#city").val()
    });
  }

  search() {
    this.setState({ loading: true });
    axios.get('/search?city=' + this.state.city, { headers: { Authorization: this.state.accessToken }})
      .then((response) => {
        localStorage.setItem('lastSearch', this.state.city);
        this.setState({ loading: false, businesses: response.data });
      })
      .catch((error) => {
        console.log(error)
      });
  }

  handleGoingClick(businessId) {
    return () => {
      // console.log("You clicked on " + businessId);
      this.setState( { loading: true });

      axios.post(`/bars/${businessId}/go`, {}, { headers: { Authorization: this.state.accessToken } })
        .then((response) => {
          // Update the attribute isGoing from the state of the database. Set false to all. Eventually set true to one.
          let businesses = JSON.parse(JSON.stringify(this.state.businesses));
          const index = businesses.findIndex(business => business.id === businessId);
          businesses = businesses.map(business => { business.isGoing = false; return business; });
          businesses[index].isGoing = response.data.isGoing;
          this.setState( { businesses: businesses, loading: false } );
        })
        .catch((error) => (console.log(error)));

    }
  }

  render() {
    return (
      <div style={{"padding": "2rem"}}>
        <AuthButton auth={this.props.auth}/>
        <div>
          <br/>
          <h2>Where are you planning to go?</h2>
          <br/>
        </div>
        <Form>
          <Form.Group>
            <Form.Input placeholder='City' id='city' onChange={this.handleChange} value={this.state.city} />
            <Form.Button disabled={this.state.city < 1} onClick={this.search}>{this.state.loading ? "Please wait…" : "Search!"}</Form.Button>
          </Form.Group>
        </Form>
        <BusinessList
          businesses={this.state.businesses}
          handleGoingClick={this.handleGoingClick}
          isDisabled={!this.state.accessToken}
        />
        <h4>Results are provided by Yelp</h4>
        <a href="https://www.yelp.com">
          <img border="0" alt="Yelp logo" src={yelpLogo} width="152.26" height="97.44" />
        </a>
      </div>
    );
  }
}


ReactDOM.render(<App auth={auth} />, document.getElementById('root'));