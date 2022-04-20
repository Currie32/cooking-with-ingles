import React from 'react';
import Grid from '@material-ui/core/Grid';


export default function GroceryList() {

  return (
    <div>
      <Grid container spacing={3}>

        <Grid item xs={12} style={{marginTop: '100px', fontSize: '24px'}}>
          Grocery list
        </Grid>


      </Grid>

    </div>
  );
}
