if (getUserId()) {

    window.location.href = "dashboard.html";

}

function showSignup() {

    document.getElementById("login-box").classList.add("hidden");

    document.getElementById("signup-box").classList.remove("hidden");

}

function showLogin() {

    document.getElementById("signup-box").classList.add("hidden");

    document.getElementById("login-box").classList.remove("hidden");

}

document.getElementById("login-form")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const email =
    document.getElementById("login-email").value;

    const password =
    document.getElementById("login-password").value;

    try{

        const response = await fetch(

            API_BASE_URL + "/login",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    email,

                    password

                })

            }

        );

        const data = await response.json();

        if(!response.ok){

            throw new Error(data.detail);

        }

        saveSession(data.user);

        window.location="dashboard.html";

    }

    catch(err){

        document.getElementById("login-error")
        .textContent=err.message;

    }

});


document.getElementById("signup-form")
.addEventListener("submit",async function(e){

    e.preventDefault();

    const name=
    document.getElementById("signup-name").value;

    const email=
    document.getElementById("signup-email").value;

    const password=
    document.getElementById("signup-password").value;

    try{

        const response=await fetch(

            API_BASE_URL+"/signup",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    name,

                    email,

                    password

                })

            }

        );

        const data=await response.json();

        if(!response.ok){

            throw new Error(data.detail);

        }

        saveSession(data.user);

        window.location="dashboard.html";

    }

    catch(err){

        document.getElementById("signup-error")
        .textContent=err.message;

    }

});