const cds = require('@sap/cds');
const axios = require('axios');
const { request } = require('express');
const { Products, Orders, Order_Details } = cds.entities;



module.exports = cds.service.impl(async (srv) => {

    // Northwind - Products
    srv.before('READ', 'Products', async () => {

        await axios.get('https://services.odata.org/Experimental/Northwind/Northwind.svc/Products?$orderby=ProductID')
            .then(async function (response) {
                let datosProducts = response.data.value;
                let arregloProducts = [];

                datosProducts.forEach(element => {
                    arregloProducts.push({
                        ID: element.ProductID,
                        ProductName: element.ProductName,
                        QuantityPerUnit: element.QuantityPerUnit,
                        UnitPrice: element.UnitPrice,
                        UnitsInStock: element.UnitsInStock,
                        UnitsOnOrder: element.UnitsOnOrder,
                        ReorderLevel: element.ReorderLevel,
                        Discontinued: element.Discontinued
                    });
                });
                
                // INSERT en la entidad del proyecto (Products)
                await cds.run(INSERT.into(Products).entries(arregloProducts));
                console.log("Los productos fueron importados con éxito");

            })
            .catch(function (error) {
                // handle error
                console.log(error);
                console.log("Fyah (Products)");
            });


    });




    // Northwind - Orders
    srv.before('READ', 'Orders', async () => {

        await axios.get('https://services.odata.org/Experimental/Northwind/Northwind.svc/Orders?$orderby=OrderID')
            .then(async function (response) {
                let datosOrders = response.data.value;
                let arregloOrders = [];

                datosOrders.forEach(element => {
                    arregloOrders.push({
                        ID : element.OrderID,
                        OrderDate : element.OrderDate,
                        id_adicional : `${element.RequiredDate} - ${element.ShipRegion}`,
                        RequiredDate : element.RequiredDate,
                        ShippedDate : element.ShippedDate,
                        ShipVia : element.ShipVia,
                        Freight : element.Freight,
                        ShipName : element.ShipName,
                        ShipAddress : element.ShipAddress,
                        ShipRegion : element.ShipRegion,
                        ShipCity : element.ShipCity,
                        ShipPostalCode : element.ShipPostalCode,
                        ShipCountry : element.ShipCountry
                    });
                });
                
                // INSERT en la entidad del proyecto (Products)
                await cds.run(INSERT.into(Orders).entries(arregloOrders));
                console.log("Las Ordenes fueron importadas con éxito");

            })          
            .catch(function (error) {
                // handle error
                console.log(error);
                console.log("Fyah (Orders)");
            });
    });



    // Northwind - Order_Details
    srv.before('READ', 'Order_Details', async () => {

        await axios.get('https://services.odata.org/Experimental/Northwind/Northwind.svc/Order_Details?$filter=ProductID lt 20 and OrderID lt 10447')
            .then(async function (response) {
                let datosDetails = response.data.value;
                let arregloDetails = [];

                for (let i = 0; i < datosDetails.length; i++) {
                    arregloDetails.push({
                        Order_ID : datosDetails[i].OrderID,
                        Product_ID :  datosDetails[i].ProductID,
                        UnitPrice : datosDetails[i].UnitPrice,
                        Quantity : datosDetails[i].Quantity,
                        Discount : datosDetails[i].Discount
                    });
                };

                // INSERT en la entidad del proyecto (Products)
                await cds.run(INSERT.into(Order_Details).entries(arregloDetails));
                console.log("Los detalles de las ordenes fueron importados con éxito");

            })          
            .catch(function (error) {
                // handle error
                console.log(error);
                console.log("Fyah (Orders_Details)");
            });
    });



    // Control de Stock
    srv.after('CREATE', 'Order_Details', async (data,req) => {
        
        const { Quantity, product_ID } = req.data;
        
        try {
            let stock = await cds.run(SELECT('unitsInStock','unitsOnOrder').one.from(Products).where({ ID: product_ID }));

            if ((stock.UnitsOnOrder + Quantity) > stock.UnitsInStock) {
                req.reject(405, `No se puede vender el producto ya que supera su stock disponible`);
            }

            await cds.run(UPDATE(Products).with({unitsOnOrder: { '+=': Quantity }}).where({ ID: product_ID}));
            console.log(`Valor ingresado con éxito`);
        } catch (error) {
            console.log(error);
            console.log(`Explotus`);
        }
        
    });

    // Práctica de Delete
    srv.on('borrarProducto', async (req) => {
        const { product_ID } = req.data;
        console.log(product_ID);

        try {
            await cds.run(DELETE.from(Products).where ({ID:product_ID}));
            console.log("Eliminado con éxito");
        } catch (error) {
            console.log(error);
            return `Explotus`;
        }
    });
});