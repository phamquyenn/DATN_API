const pageMappings = {
    'product': 'product',
    'clients': 'clients',
    'order': 'order',
    'users': 'users',
    'news': 'news',
    'brands': 'brands',
};

exports.renderPage = (pageName, res) => {
    const templateName = pageMappings[pageName];

    if (templateName) {
        res.render(templateName);
    } else {
        res.status(404).send('Page not found');
    }
};