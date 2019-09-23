
function click_input_file(){


	document.getElementById('fileImage').click()
}

function set_to_image(){
	
	var preview = document.getElementById('image_preview');
	var file   = document.getElementById("fileImage").files[0]
	var reader  = new FileReader();
	reader.onloadend = function () {
	    	preview.src = reader.result;
	    	set_filter_image()
	  	}

	if (file) {
	    reader.readAsDataURL(file);
	} 
	else {
		preview.src = "";
	}

	document.getElementById("image_preview").className = "image_preview"
	document.getElementById("txt_escolha").className = "none"
	document.getElementById("input_file_false").className = "none"
	
	document.getElementById("local_pub").className = "input_false_pub"
	document.getElementById("legenda_pub").className = "input_false_pub"
	

	document.getElementById("filtro").className = "filtro"
	document.getElementById("btn_pub").className = "btn_pub"

	
}
function set_filter_image(){

	fileLoad = document.getElementById('image_preview').src
	imagens_filtro = document.getElementsByClassName("img_filtro")
	for(i in imagens_filtro){
		console.log(imagens_filtro[i])
		imagens_filtro[i].src = fileLoad
	}

}

function set_filter(filterName){
	document.getElementById('image_preview').className = "image_preview "+filterName
	document.getElementById('value_filter').value = filterName
}