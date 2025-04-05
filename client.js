const stripe = Stripe("pk_live_51RAYADBNPvw211XQ1H8bnhviUTIsJc0kU32EdCY7OoQ7JIViKBXEo0E8XovDsC4hx0O8Z4MspJinqOeuqDEE4aye00GxnLGP5X");

fetch("/create-payment-intent", {
  method: "POST"
})
  .then(res => res.json())
  .then(data => {
    const paymentRequest = stripe.paymentRequest({
      country: "FR",
      currency: "eur",
      total: {
        label: "Pack privé",
        amount: 500, // = 5,00€
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    paymentRequest.canMakePayment().then(result => {
      if (result) {
        const prButton = stripe.elements().create("paymentRequestButton", {
          paymentRequest,
        });
        prButton.mount("#payment-request-button");
      } else {
        document.getElementById("payment-request-button").style.display = "none";
      }
    });

    paymentRequest.on("paymentmethod", async (ev) => {
      const {clientSecret} = data;

      const {paymentIntent, error: confirmError} = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: ev.paymentMethod.id,
        },
        {handleActions: false}
      );

      if (confirmError) {
        ev.complete("fail");
      } else {
        ev.complete("success");
        if (paymentIntent.status === "requires_action") {
          stripe.confirmCardPayment(clientSecret).then(result => {
            if (result.error) {
              console.error(result.error.message);
            } else {
              window.location.href = "https://pixeldrain.com/u/VGyHhJHJ";
            }
          });
        } else {
          window.location.href = "https://pixeldrain.com/u/VGyHhJHJ";
        }
      }
    });
  });
