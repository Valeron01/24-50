def product_to_json(i):
    return {
            'productName': i.name,
            'cost': i.price,
            'seller': i.seller.username,
            'description': i.description,
            'category': i.category.name,
            'image': i.image_name,
            'id': i.id
            }