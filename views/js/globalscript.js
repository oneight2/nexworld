fetch('/virtual/sessions', {
	method: 'POST',
	headers: {
		'Authorization': 'Bearer ' + localStorage.getItem('synnex-jwt')
	}
})
.then(response => response.json())
.then(data => console.log('Authorized'))
.catch(error => {
	
	localStorage.removeItem("synnex-user");
    localStorage.removeItem("synnex-jwt");
    window.location.replace('/')
    
})