# Bugs

**1.** `modules/Offer/Selling/Selling.js`
- Due to offers being appended one by one (I think, not too sure), the placeholder disappears too soon and you can see how the offer cards actively changes.
- `render()` is being called as many times as there are offers, which causes `renderOffer()` to be called by that amount but multiplied with itself
