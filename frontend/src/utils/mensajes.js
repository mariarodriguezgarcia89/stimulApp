export const mensajes = {
  // --- REGISTRO ---
  nombreObligatorio: 'Por favor, escriba su nombre para que sepamos cómo llamarle.',
  apellidosObligatorios: 'Por favor, escriba sus apellidos para completar su perfil.',
  emailObligatorio: 'Necesitamos su correo electrónico para crear su cuenta.',
  emailInvalido: 'El correo no parece estar bien escrito. Asegúrese de que incluye una "@" (arroba) y termina en algo como .com o .es.',
  passwordObligatoria: 'Es necesario que elija una contraseña para proteger su cuenta.',
  fechaNacimientoObligatoria: 'Por favor, indique su día, mes y año de nacimiento en los selectores.',
  passwordsNoCoinciden: 'Las contraseñas no son iguales. Asegúrese de escribir exactamente lo mismo en las dos casillas para evitar errores.',
  errorRegistro: 'No hemos podido crear su cuenta en este momento. Por favor, revise los datos e inténtelo de nuevo.',

  // --- LOGIN ---
  emailOPasswordIncorrectos: 'El correo o la contraseña no son correctos. Por favor, revíselos y vuelva a intentarlo.',
  errorLogin: 'Ha ocurrido un problema al entrar en su cuenta. Por favor, inténtelo de nuevo en unos instantes.',

  // --- PERFIL ---
  errorActualizarPerfil: 'No hemos podido guardar los cambios en su perfil. Por favor, inténtelo de nuevo.',
  exitoActualizarPerfil: '✅ ¡Muy bien! Sus datos se han guardado correctamente.',

  // --- GENERAL ---
  errorServidor: 'Parece que hay un problema de conexión con nuestro servidor. No se preocupe, inténtelo más tarde.'
}

// --- INSTRUCCIONES REFRÁN ---
export const instruccionesRefranFacil = [
  '📖 Verás la primera parte de un refrán popular español. ¡Seguro que lo conoces!',
  '👆 Pulsa la opción que creas que completa el refrán correctamente. Hay tres opciones para elegir.',
  '✅ Si aciertas, ¡genial! Ganas 10 puntos y puedes seguir al siguiente.',
  '❌ Si te equivocas, no te preocupes — te mostraremos cuál era la respuesta correcta.',
  '⏭ Si no recuerdas un refrán, puedes saltarlo sin ninguna penalización. ¡No pasa nada!',
  '🏁 Cuando termines los 10 refranes, verás un resumen con tu puntuación final.'
]

export const instruccionesRefranDificil = [
  '📖 Verás la primera parte de un refrán popular español. ¡A ver si lo recuerdas!',
  '✍️ Escribe tú mismo en el cuadro de texto cómo termina el refrán.',
  '⏱ Tienes 30 segundos para escribir tu respuesta. ¡Tómate tu tiempo pero no te despistes!',
  '✅ Si aciertas, ¡estupendo! Ganas 10 puntos y sigues adelante.',
  '❌ Si se acaba el tiempo o te equivocas, te mostraremos la respuesta correcta.',
  '⏭ Si no recuerdas un refrán, puedes saltarlo cuando quieras sin penalización.',
  '🏁 Al terminar los 10 refranes, verás un resumen con tu puntuación final.'
]

export const instruccionesMemoryFacil = [
  '🃏 Verás 8 cartas boca arriba durante 3 segundos. ¡Memoriza dónde está cada una!',
  '🔄 Después se voltearán y tendrás que encontrar las 4 parejas iguales.',
  '👆 Pulsa una carta para voltearla, luego pulsa otra para intentar emparejarla.',
  '✅ Si aciertas, ganas 10 puntos y las cartas se quedan visibles.',
  '❌ Si fallas, pierdes 3 puntos y las cartas se vuelven a voltear.',
  '🏁 La partida acaba cuando encuentras todas las parejas.'
]

export const instruccionesMemoryDificil = [
  '🃏 Verás 16 cartas boca arriba durante 3 segundos. ¡Memoriza dónde está cada una!',
  '🔄 Después se voltearán y tendrás que encontrar las 8 parejas iguales.',
  '👆 Pulsa una carta para voltearla, luego pulsa otra para intentar emparejarla.',
  '✅ Si aciertas, ganas 10 puntos y las cartas se quedan visibles.',
  '❌ Si fallas, pierdes 3 puntos y las cartas se vuelven a voltear.',
  '⏱ Tienes 60 segundos para encontrar todas las parejas. ¡Concentración!'
]

export const instruccionesIntrusoFacil = [
  '🖼️ Verás 4 imágenes en pantalla. Tres pertenecen a la misma categoría (por ejemplo, animales) y una no pertenece (el "intruso").',
  '🔍 Tu tarea es encontrar cuál es el intruso, el que no encaja con los demás.',
  '👆 Pulsa la imagen que crees que es el intruso para responder.',
  '✅ Si aciertas, ganas 10 puntos.',
  '💡 Después de cada respuesta, te explicaremos por qué ese era el intruso.',
  '🏁 La partida acaba después de 3 rondas.'
]

export const instruccionesIntrusoDificil = [
  '🖼️ Verás 4 imágenes en pantalla. Tres pertenecen a la misma categoría y una no pertenece (el "intruso").',
  '🤔 En este nivel las categorías son más sutiles, así que tendrás que pensar bien.',
  '⏱ Tienes 30 segundos para responder cada ronda. ¡No te despistes!',
  '👆 Pulsa la imagen que crees que es el intruso para responder.',
  '✅ Si aciertas, ganas 10 puntos.',
  '💡 Después de cada respuesta, te explicaremos por qué ese era el intruso.',
  '🏁 La partida acaba después de 3 rondas.'
]