exports.saveShoppingCart = () => {
    fs.writeFileSync(
        path.join(__dirname, "shoppingCart.json"),
        JSON.stringify(shoppingCar, null, 2),
        "utf8"
    );
};