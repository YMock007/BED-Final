document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const warningText = document.createElement("div");
            warningText.className = "alert";
            warningText.style.display = 'none';
            warningText.classList.add("alert-warning");
            warningText.style.position = 'fixed';
            warningText.style.top = '25%';
            warningText.style.left = '50%';
            warningText.style.transform = 'translateX(-50%)';
            warningText.style.width = '80%';
            warningText.style.maxWidth = '400px'; // Set a maximum width for smaller screens
            warningText.style.padding = '10px';
            warningText.style.textAlign = 'center';
            warningText.style.borderRadius = '5px';
            warningText.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
            warningText.style.zIndex = '99999';


    const verifyTokenCallback = (verifyStatus, verifyData) => {    
        if(verifyStatus === 200) {
            console.log("Token Verification Status:", verifyStatus);
            console.log("Token Verification Data:", verifyData);

            const tradesCallBack = (tradesStatus, tradesData) => {
                console.log("Trades Status:", tradesStatus);
                console.log("Trades Data:", tradesData);
                const tradesList = document.getElementById("tradesList");
                tradesList.innerHTML = "";
                tradesList.appendChild(warningText)

                if(tradesStatus !== 200 || tradesData.length === 0) {
                    warningText.style.display = 'block';
                    warningText.innerHTML = "No Trades Found."
                    setTimeout(()=> {
                        warningText.style.display = 'none';
                    }, 3000)
                } else {
                    tradesData.forEach(async trade => {
                        const displayItem = document.createElement("div");
                        displayItem.className = "col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12 mb-4 position-relative";
                        const isTradeAvailable = !(trade.buyer_user_id && trade.buyer_user_name && trade.trade_date);
                        const itemName = trade.equipment_name ? trade.equipment_name : (trade.skill_name ? trade.skill_name : 'N/A');
                        const type = trade.equipment_name ? 'equipment' : (trade.skill_name ? 'skill' : 'N/A');

                        function itemPromise () {
                        return new Promise((resolve, reject) => {
                            const itemCallBack = (itemStatus, itemData) => {
                                if (itemStatus === 200) {
                                    resolve(itemData);
                                } else {
                                    reject("No item data");
                                }
                            };
                            fetchMethod(currentUrl + `/api/${type === 'equipment' ? 'arsenals' : 'libraries'}/${type}/${itemName}`, itemCallBack);
                            });
                        }
                        let itemData;
                        try {
                            itemData = await itemPromise();
                        } catch(error) {
                            console.log(error);
                            return
                        }
                        
                        console.log(itemName);
                        console.log(type);
                        console.log(itemData)
                        displayItem.innerHTML = `
                            <div class="card thread-card">
                                <div class="card-body">
                                    <h5 class="card-title">Trade ID: ${trade.trade_id}</h5>
                                    <p class="card-text">
                                        <span>Seller Name:</span> ${trade.seller_user_name} <br>
                                        ${!isTradeAvailable ? `<span>Buyer Name:</span> ${trade.buyer_user_name} <br>` : ''}
                                        <span>${type} Name:</span> ${itemName} <br>
                                        <span>Health Points:</span> ${itemData.hp} <br>
                                        <span>Attack:</span> ${itemData.atk} <br>
                                        <span>Defense:</span> ${itemData.def} <br>
                                        <span>Selling Points:</span> ${trade.points} <br>
                                        ${!isTradeAvailable ? `
                                        <span>Status:</span><span style="color: crimson;"> Unavailable</span> <br>
                                        <span style="color: crimson;">Trade Date:</span> ${trade.trade_date} <br>
                                        ` : '<span>Status:</span><span style="color: green;"> Available</span> <br>'}
                                    </p>
                                    ${isTradeAvailable ? `
                                    <div class="trade-button-container">
                                        <button " class="btn btn-primary btn-sm trade-button" data-trade-id="${trade.trade_id}">
                                            <i class="fa-solid fa-cart-shopping"></i> Buy
                                        </button>
                                    </div>
                                    ` : ''} 
                                </div>
                            </div>
                        `;
                        
                        tradesList.appendChild(displayItem);
                        if(verifyStatus === 200 && trade.trade_id) {
                            const data = {
                                trade_id: trade.trade_id,
                                buyer_user_id: verifyData.user_id
                            }
                            console.log(data)
                            const tradeButton = displayItem.querySelector('.trade-button');
                            tradeButton.addEventListener('click', () => {
                                if(trade.seller_user_id === verifyData.user_id ) {
                                    warningText.style.display = 'block';
                                    warningText.innerHTML = "User can't buy his own selling item."
                                    setTimeout(() => {
                                        warningText.style.display = 'none';
                                    }, 2000);    
                                    return;
                                }
                                const buyPopUp = document.getElementById('buyPopUp');
                                buyPopUp.style.display = 'block';
                                // Add event listener for confirm buy button
                                const confirmBuyButton = document.getElementById("confirmBuy");
                                confirmBuyButton.addEventListener("click", () => {
                                // Fetch API to delete Post
                                const tradeItemCallback = (tradeStatus, tradeData) => {
                                    if (tradeStatus === 200) {
                                        // Eliminate the need for alert and simply reload the page
                                        warningText.style.display = 'block';
                                        warningText.innerHTML = "Buying item success";
                                        buyPopUp.style.display = "none";
                                        setTimeout(() => {
                                            warningText.style.display = 'none';
                                            location.reload();
                                        }, 2000);
                                    } else {
                                        warningText.style.display = 'block';
                                        warningText.innerHTML = `${tradeData.error ? tradeData.error : (tradeData.message ? tradeData.message : tradeData)}`
                                        buyPopUp.style.display = "none";
                                        setTimeout(() => {
                                            warningText.style.display = 'none';
                                        }, 2000);
                                    }
                                };

                                // Fetch the trade API
                                fetchMethod(currentUrl + `/api/trades/buy/`, tradeItemCallback, "POST", data);
                                });

                                // Add event listener for cancel buy button
                                const cancelBuyButton = document.getElementById("cancelDBuy");
                                cancelBuyButton.addEventListener("click", () => {
                                // Hide the popup without trading the item
                                buyPopUp.style.display = "none";
                                });
                            });
                        } 
                    });                     
                }
            };
            fetchMethod(currentUrl + "/api/trades/", tradesCallBack);
        } else {
            const tradesList = document.getElementById("tradesList");
            tradesList.innerHTML = "";
            tradesList.appendChild(warningText)
            warningText.style.display = 'block';
            warningText.innerHTML = "To trade the user must log in first."
            setTimeout(()=> {
                warningText.style.display = 'none';
            }, 3000)
        }
    };
    fetchMethod(currentUrl + "/api/jwt/verify/", verifyTokenCallback, "GET", null, token);
})