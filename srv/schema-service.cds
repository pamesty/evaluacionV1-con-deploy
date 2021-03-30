using { productos as my} from '../db/schema';

@(path: '/General')
service Detalles @(requires: 'admin'){
    entity Order_Details as projection on my.Order_Details;

    entity Datos_Producto as select from my.Order_Details {
        *,
        // UnitPrice as Precio_Unitario,
        // Quantity as Cantidad,
        // Discount as Descuento,
        product.ProductName as Nombre_Producto,
        product.QuantityPerUnit as Cantidad_Por_Unidad,
        product.UnitPrice as Precio_Unitario_Producto,
        product.UnitsInStock as Unidades_En_Stock,
        product.UnitsOnOrder as Unidades_En_Orden,
        product.ReorderLevel as Nivel_De_Reorden,
        product.Discontinued as Descontinuado,
        order.ShipCountry as Country
    };
}

@(path: '/Auth')
service api @(_requires: 'authenticated-user') {

    entity Products as projection on my.Products;

    entity Orders as projection on my.Orders;

    action borrarProducto (product_ID : Products : ID) returns String;
}