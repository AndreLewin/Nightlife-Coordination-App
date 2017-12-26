import React from 'react';
import { List } from 'semantic-ui-react';

import Business from './Business.jsx';


const BusinessList = ({businesses, handleGoingClick, isDisabled}) => {
  const businessList = businesses.map((business, index) => {
    return (
      <Business
        key={business.id}
        business={business}
        handleGoingClick={handleGoingClick}
        isDisabled={isDisabled}
      />
    );
  });

  return (
    <List>
      {businessList}
    </List>
  );
};

export default BusinessList;