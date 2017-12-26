import React from 'react';
import { List, Image, Button } from 'semantic-ui-react';

const Business = ({business, handleGoingClick, isDisabled}) => {
  return (
    <List.Item>
      <Image size='tiny' src={business.image_url} href={business.url} />
      <List.Content>
        <List.Header>
          <a href={business.url}>
            {business.name}
          </a>
            
          <Button
            basic size='mini' toggle
            onClick={handleGoingClick(business.id)}
            active={business.isGoing}
            disabled={isDisabled}
          >
            {business.othersGoing + " "}
            {business.isGoing && "+ 1 "}
            going
          </Button>
        </List.Header>
        <List.Description>{business.location.address1}</List.Description>
      </List.Content>
    </List.Item>
  );
};

export default Business;