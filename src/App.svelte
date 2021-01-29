<script>
  import { onMount } from 'svelte';
  import { createScene } from "./scene";
  let el;
  onMount(() => {
    createScene(el)
  });
  let rand = Math.floor(Math.random()*100);
</script>
<div class="container">
	<canvas bind:this={el}></canvas>
</div>
<p>
	willame {rand}
</p>

<style>
p{
	color:white;
	top: -60px;
	position: relative;
	left: 30px;
}
.container{
	widows: 100vw;
	height: 100vh;
}
canvas{
	display: block;
}
</style>