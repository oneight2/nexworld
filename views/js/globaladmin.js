fetch('/admin', {
	method: 'POST',
	headers: {
		'Authorization': 'Bearer ' + localStorage.getItem('synnex-admin-jwt')
	}
})
.then(response => response.json())
.then(data => console.log('Authorized'))
.catch(error => {
	
	localStorage.removeItem("synnex-admin-user");
    localStorage.removeItem("synnex-admin-jwt");
    window.location.replace('/adminlogin?message=2')
    
})