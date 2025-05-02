/* login dialog popup */
( ()=>{

    let stompClient = null;
    let socket;
    function loginStatus(info){
        console.table("loginStatus:", info)

        document.querySelector(".user").textContent = info.user;
        document.querySelector(".count").textContent = info.count;
        document.querySelector(".info").style.display="inline";
        document.querySelector(".btnLogin").style.display="none";
    }


    // 상태값 유지
    let info = sessionStorage.getItem("info");
    if(info){
        info = JSON.parse(info);
        loginStatus(info);
    }

    // 로그인 버튼이 클릭되었을때
    let btnLogin = document.querySelector(".btnLogin");
    btnLogin.addEventListener("click", ()=>{
        let dialogLogin = document.querySelector(".dialogLogin");
        dialogLogin.showModal();
        let btnCancel = dialogLogin.querySelector(".btnCancel");
        btnCancel.addEventListener("click", ()=>{
            dialogLogin.close();
        })

        // 폼안에서 로그인 버튼(OK)버튼이 클릭된 경우
        let btnOK = dialogLogin.querySelector(".btnOK");
        btnOK.addEventListener("click", ()=>{
            let frmLogin = dialogLogin.querySelector(".frmLogin");
            let formData = new FormData(frmLogin);
            fetch("/login", {
                method : "POST",
                body : formData
            }).then( resp => resp.text())
            .then(async (info) => {

                sessionStorage.setItem("info", info);
                data = JSON.parse(info);
                console.log('data------------', data);
                loginStatus(data);
                dialogLogin.close();
                await connect(); //사용자 id를 사용한 소캣통신
                let message = {
                    'userID' : data.user,
                    'command' : 'login'
                }
                sendMessage(message);

            })
        })
    })

    // 게시물 보기
    let noticeList = document.querySelector(".count");
    noticeList.addEventListener("click", ()=>{
        let notice = document.querySelector("#notice");
        let info = sessionStorage.getItem("info");
        info = JSON.parse(info);
        let user = info.user;
        console.log("user", user)
        let formData = new FormData();
        formData.append("id", user);
        fetch("/notiList",{
            method : "POST",
            body : formData
        })
        .then(resp=>resp.json())
        .then(data =>{
            let items = document.querySelector(".items")
            let template = document.querySelector(".item");
            items.innerHTML = "";
            data.list.forEach(d=>{
                console.log("d:", d);
                let clone = template.content.cloneNode(true);
                clone.querySelector(".sno").textContent=d.sno;
                clone.querySelector(".subject").textContent=d.subject;
                clone.querySelector(".doc").textContent=d.doc;
                clone.querySelector(".checking").textContent=d.checking;

                items.append(clone);
            })
        })
        notice.style.display="block";

    })

    // 공지 처리
    let btnInsert = document.querySelector(".btnInsert");
    btnInsert.addEventListener("click", ()=>{
        let dialogNotice = document.querySelector(".dialogNotice");
        dialogNotice.showModal();
        dialogNotice.querySelector(".btnCancel").addEventListener("click", ()=>{
            dialogNotice.close();
        })

        // 공지 입력
        dialogNotice.querySelector(".btnInsert").addEventListener("click", ()=>{
            let frm = dialogNotice.querySelector(".frmNotice");
            let formData = new FormData(frm);
            fetch("/noticeInsert",{
                method : "POST",
                body : formData
            })
            .then(resp => resp.json())
            .then(data => {
                // 공지가 추가되었음을 알리는 정보 전송
                
            })
            .error(err=>{
                console.log(err);
            })
        })
    })


    
    // 로그아웃 버튼이 클릭되었을때
    let btnLogout = document.querySelector(".btnLogout");
    btnLogout.addEventListener("click", ()=>{
        sessionStorage.removeItem("info");
        document.querySelector(".btnLogin").style.display=""
        document.querySelector(".info").style.display="none";
        let notice = document.querySelector("#notice");
        notice.style.display="none";
        // 연결 종료
        if(stompClient){
            stompClient.disconnect();

        }
    })


    // soket 통신 
    function connect(){
        return new Promise( (resolve, reject)=>{
            socket = new SockJS("/ws");
            stompClient = Stomp.over(socket);
            stompClient.connect({}, (frame)=>{
                console.log("Connected:", frame);
                stompClient.subscribe("/topic/events", (event)=>{
                    showMessage(event.body);
                });
                resolve(stompClient);
            }, (error)=>{
                console.error("연결실패:", error);
                reject(error);
            })

        })
    }

    function sendMessage(message) {
        console.table('sendMessage', message);
        if (stompClient) {
            stompClient.send("/app/sendMessage", {}, JSON.stringify( message ));
        } else {
            console.log("StompClient is not connected.");
        }
    }

    function showMessage(message){
        console.log('showMessage:', message);
    }

})()