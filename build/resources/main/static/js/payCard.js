const app = Vue.createApp({
    data() {
        return {
            cardHolder: "",
            cardNumber: "",
            cvv: null,
            amount: null,
            urlSelect: "",
            /* Add To Cart*/
            cart: {
                cartdtos: [],
                ticketDtos: [],
            },

            products: [],

            activeNavbar: false,
            activeMenu: false,
        }
    },
    created() {
        axios.get("/api/products")
            .then(res => {
                this.products = res.data
                console.log(this.products)
            })
        if (JSON.parse(sessionStorage.getItem("cart"))) {
            this.cart = JSON.parse(sessionStorage.getItem("cart"))
        } else {
            sessionStorage.setItem("cart", JSON.stringify(this.cart))
        }
    },
    methods: {
        pay() {
            // axios({
            //         method: "post",
            //         url: "http://localhost:8686/api/clients/pay",
            //         data: {
            //             cardHolder: this.cardHolder,
            //             cardNumber: this.cardNumber,
            //             cvv: parseInt(this.cvv),
            //             amount: parseInt(this.amount),
            //             description: "Lollapalooza-market"
            //         },
            //     })

            var data = {
                cardHolder: this.cardHolder,
                cardNumber: this.cardNumber,
                cvv: parseInt(this.cvv),
                amount: parseInt(this.amount),
                description: "Lollapalooza-market"
            }

            fetch("https://bs2banking.herokuapp.com/api/clients/pay", {
                    method: 'POST', // or 'PUT'
                    body: JSON.stringify(data), // data can be `string` or {object}!                
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    mode: 'no-cors',
                })
                .then(res => {
                    if (res.status == 200 || res.status == 202) {
                        axios.post("/api/users/current/payment", this.cart)
                            .then(res => {
                                swal("Genial", "Compra exitosa ", "success").then(res => location.href = 'http://localhost:8080/index.html');
                            })
                    }
                    return swal('No se pudo procesar el pago, revise los datos de la tarjeta')
                })
                .catch(error => {
                    swal("Error", "Error para procesar pago con su banco", "error");
                })
        }
    },
    computed: {
        totalPrice() {

            if (this.products.length == 0) {
                return
            }
            let price = 0
            if (this.cart.ticketDtos.length == 2) {
                price = this.ticketPrice - (this.ticketPrice * 0.10)
            } else if (this.cart.ticketDtos.length > 2) {
                price = this.ticketPrice - (this.ticketPrice * 0.20)
            }

            let ids = this.cart.cartdtos.map(e => e.idItem)

            let counter = 0
            let total = 0

            for (let i = 0; i < ids.length; i++) {
                counter = this.products.filter(e => e.id == ids[i])[0].price * this.cart.cartdtos[i].quantity
                total += counter
            }

            let tktCounter = this.cart.ticketDtos.length * price
            this.amount = total + tktCounter;
            return this.amount
        },

    }
}).mount("#app")