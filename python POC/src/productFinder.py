import openfoodfacts as opf
import UPCscanner

def searchProduct():

    data, type = UPCscanner.liveUPC()
    product = opf.products.get_product(str(data))

    return product, type

#Sometimes throws some unknown assertion
print(searchProduct()[0])