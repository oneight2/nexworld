<<<<<<< HEAD
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
=======
fetch("/admin", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + localStorage.getItem("synnex-admin-jwt"),
  },
})
  .then((response) => response.json())
  .then((data) => console.log("Authorized"))
  .catch((error) => {
    localStorage.removeItem("synnex-admin-user");
    localStorage.removeItem("synnex-admin-jwt");
    window.location.replace("/adminlogin?message=2");
  });

const adminPath = window.location.pathname.split("/");
$(`#${adminPath[2]}`).css("background-color", "#1656d0");
>>>>>>> 6a80a6f8e4022272414fc0b24eff259f5b315ec2
