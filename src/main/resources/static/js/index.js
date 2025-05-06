( ()=>{ /* 즉시 실행 함수형 */

    let stompClient = null; //메시지 송수신 객체
    let socket; //socket 정보

    // 로그인 상태값 재 설정
    function loginStatus(info){
        document.querySelector("#id").textContent = info.id;
        document.querySelector(".count").textContent = info.count;
        document.querySelector(".info").style.display=info.logoutState;
        document.querySelector(".btnLogin").style.display=info.loginState;
        if(info.noticeDisplay){
            document.querySelector("#notice").style.display="block";
        }else{
            document.querySelector("#notice").style.display="none";
        }
    }

    // 상태값 유지
    if(stompClient) stompClient.disconnect();  
    let info = sessionStorage.getItem("info"); 
    if(info){
        info = JSON.parse(info); 
        loginStatus(info); 
        connect(info.id) 
        .then(()=>{ 
            if(info.noticeDisplay) reloadList(); 
        })
    }else{
        document.querySelector(".info").style.display="none"; 
    }

    // 로그인 버튼이 클릭되었을때
    let btnLogin = document.querySelector(".btnLogin");// 로그인 버튼 
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
            // 사용자 id를 사용한 소캣통신
            connect(frmLogin.id.value)
            .then(()=>{
                let message = { 
                    'command' : 'login',
                    'id'  : frmLogin.id.value,
                    'pwd' : frmLogin.pwd.value
                }
                sendMessage(message); 
            })
            .catch((err)=>{
                console.log(err);
            }); 
            dialogLogin.close();
        })
    })
    
    // 로그아웃 버튼이 클릭되었을때
    let btnLogout = document.querySelector(".btnLogout");
    btnLogout.addEventListener("click", ()=>{
        sessionStorage.removeItem("info"); 
        document.querySelector(".btnLogin").style.display="inline" 
        document.querySelector(".info").style.display="none"; 
        document.querySelector("#notice").style.display="none"; 
        // 연결 종료
        if(stompClient){
            stompClient.disconnect(); 
        }
    })

    // soket 통신 
    function connect(id){
        return new Promise( (resolve, reject)=>{
            let client = `/topic/events/${id}`; 
            socket = new SockJS("/ws"); 
            stompClient = Stomp.over(socket); 
            stompClient.connect({}, ()=>{
                stompClient.subscribe(client, (event)=>{ 
                    showMessage(event.body); 
                });
                resolve(stompClient); 
            }, (error)=>{
                console.error("연결실패:", error);
                reject(error);
            })
        })
    }

    // 메시지 전송
    function sendMessage(message) {
        let command = message.command;
        let client = `/app/${command}`; 
        if (stompClient) {
            stompClient.send(client, {}, JSON.stringify( message ));
        } else {
            console.log("StompClient is not connected.");
        }
    }

    // 공지 목록 보기
    let noticeList = document.querySelector(".count");
    noticeList.addEventListener("click", ()=>{
        let info = JSON.parse(sessionStorage.getItem("info"));

        let notice = document.querySelector("#notice");
        
        if(notice.style.display =='block'){ 
            notice.style.display='none';
            info.noticeDisplay=false;
        }else{
            notice.style.display='block';
            info.noticeDisplay=true;
            reloadList();
        }
        sessionStorage.setItem("info", JSON.stringify(info));
    });
    
    // 공지 목록 새로고침
    function reloadList(){
        let info = JSON.parse(sessionStorage.getItem("info"));
        let message = { 
            'command' : 'list',
            'id' : info.id,
        }
        sendMessage(message); 
    }

    // 공지사항 추가입력
    let btnInsert = document.querySelector(".btnInsert");
    btnInsert.addEventListener("click", ()=>{
        let dialogNotice = document.querySelector(".dialogNotice");
        let frm = dialogNotice.querySelector(".frmNotice");
        let info = JSON.parse(sessionStorage.getItem("info"));
        frm.reset();
        frm.id.value = info.id; //작성자 아이디 설정
        
        //입력 버튼 보여주기
        dialogNotice.querySelector(".btnInsert").style.display="inline";
        // 수정, 삭제버튼 감추기
        dialogNotice.querySelector(".btnDelete").style.display="none";

        //제목, 내용 입력창 읽기전용 해제
        dialogNotice.querySelector(".subject").readOnly=false;
        dialogNotice.querySelector(".doc").readOnly=false;

        dialogNotice.showModal();
        dialogNotice.querySelector(".btnCancel").addEventListener("click", ()=>{
            dialogNotice.close();
            let newDialogNotice = dialogNotice.cloneNode(true);
            dialogNotice.replaceWith(newDialogNotice);
        })

        // 입력버튼이 클릭된 경우
        dialogNotice.querySelector(".btnInsert").addEventListener("click", ()=>{
            let message={
                'command' : "noticeInsert",
                'id' : info.id,
                'subject' : frm.subject.value,
                'doc' : frm.doc.value
            }
            sendMessage(message);
            dialogNotice.close();
        }, {once : true})
    })

    // 한개의 공지사항 생성
    addNoticeRow = (template, data)=>{
        let clone = template.content.cloneNode(true);
        let info = JSON.parse(sessionStorage.getItem("info"));
        clone.querySelector(".sno").textContent=data.sno;
        clone.querySelector(".id").textContent=data.id;
        clone.querySelector(".subject").textContent=data.subject;
        clone.querySelector(".doc").textContent=data.doc;
        clone.querySelector(".checking").textContent=data.checking;

        // 공지항목을 클릭했을 때
        let row = clone.querySelector(".row");

        //공지사항 세부내용 보기
        row.addEventListener("click", (ev)=>{
            if(data.checking !=''){ //공지상태가 미확인 인경우
                let message={
                    'command' : 'noticeViewCheck',
                    'sno' : String(data.sno),
                    'id' : info.id
                }
                sendMessage(message);
            }
            
            let dialogNotice = document.querySelector(".dialogNotice"); 
            //입력 버튼 감추기
            dialogNotice.querySelector(".btnInsert").style.display="none";

            // 작성자와 로그인 아이디가 같으면 수정, 삭제버튼 보여주기
            dialogNotice.querySelector(".subject").readOnly=true;
            dialogNotice.querySelector(".doc").readOnly=true;
            if(info.id==data.id){
                dialogNotice.querySelector(".btnDelete").style.display="inline";
            }else{
                dialogNotice.querySelector(".btnDelete").style.display="none";
            }

            let frm = dialogNotice.querySelector(".frmNotice");
            frm.id.value = data.id;
            frm.sno.value = data.sno;
            frm.subject.value = data.subject;
            frm.doc.value = data.doc;

            // 삭제 버튼
            dialogNotice.querySelector(".btnDelete").addEventListener("click", ()=>{;
                let yn = confirm("삭제 하시겠습니까?");
                if(!yn) return;
    
                let frm = dialogNotice.querySelector(".frmNotice");
                let message={
                    'command' : "noticeDelete",
                    'id' : frm.id.value,
                    'sno' : String(frm.sno.value),
                }
                sendMessage(message);
                dialogNotice.close();
                frm.reset();                
            },{once:true});

            //dialog 닫기
            dialogNotice.showModal();
            dialogNotice.querySelector(".btnCancel").addEventListener("click", ()=>{
                dialogNotice.close();
                let newDialogNotice = dialogNotice.cloneNode(true);
                dialogNotice.replaceWith(newDialogNotice);
            })            

        })
        return clone;
    }

    // 공지사항 목록 만들기
    showNoticeList = (list)=>{
        let count=0;
        let notice = document.querySelector("#notice");
        let items = document.querySelector(".items");
        let template = document.querySelector(".item");
        let clone;
        let info = sessionStorage.getItem("info");
        info = JSON.parse(info);

        items.innerHTML = "";

        list.forEach(d=>{
            if(d.checking =="미확인") count++;
            clone = addNoticeRow(template, d);
            items.append(clone);

        })

        info.count = count;
        sessionStorage.setItem("info", JSON.stringify(info));

        document.querySelector(".count").textContent = count;
        notice.style.display="block";
    }

    // 배지 애니메이션 
    function badgeAni(){
        let count = document.querySelector(".count");
        count.style.animation="pulse 3s 5";

        count.addEventListener("animationend", () => {
            count.style.animation = ""; // 초기화하여 재사용 가능
        });
    }

    // 공지목록이 표시되어 있는 상태라면 전달된 Notice정보를 상단에 추가함
    noticeInsert = (msg)=>{
        let info = JSON.parse(sessionStorage.getItem("info"));
        document.querySelector(".count").textContent = msg.cnt;
        requestAnimationFrame(badgeAni);
        if(info.noticeDisplay){
            let items = document.querySelector(".items");
            let template = document.querySelector(".item");
            let clone = addNoticeRow(template, msg.noticeVo);
            
            items.prepend(clone); //12-k)
        }
    }

    // 공지목록이 표시되어 있는 상태라면 sno에 해당하는 목록을 화면에서 제거
    noticeDelete = (msg)=>{
        let info = JSON.parse(sessionStorage.getItem("info"));
        let count = Number(document.querySelector(".count").textContent);
        let items = document.querySelector(".items");
        let rows = items.querySelectorAll(".row");
        rows.forEach(row =>{
            let sno = row.querySelector(".sno").textContent;
            if(sno == msg.sno){
                if(row.querySelector(".checking").textContent=='미확인'){
                    count--;
                }
                if(info.noticeDisplay){
                    items.removeChild(row);
                }
            }
        })
        document.querySelector(".count").textContent = count;
    }

    // socket server로 부터 메시지가 전달되었을 때
    function showMessage(message){
        let msg = JSON.parse(message);
        if( !msg.status ) return;
        
        switch(msg.command){
            case "login" :
                msg.loginState = "none";
                msg.logoutState = "inline";
                sessionStorage.setItem("info", JSON.stringify(msg));
                loginStatus(msg);
                break;

            case "list":
                showNoticeList(msg.list);
                break;

            case "noticeViewCheck":
                reloadList();
                break;

            case "noticeInsert":
                noticeInsert(msg);
                break;

            case "noticeDelete":
                noticeDelete(msg);
                break;

        }
    }

})()
