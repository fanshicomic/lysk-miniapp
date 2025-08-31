Component({
  properties: {
    // The title to display on the card
    title: {
      type: String,
      value: 'Default Title'
    },
    // The gradient style type ('one', 'two', or 'three')
    gradientType: {
      type: String,
      value: 'one' // Default to the first style
    }
  }
})