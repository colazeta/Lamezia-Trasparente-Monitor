<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" encoding="utf-8" indent="no"/>

    <xsl:param name="titolo">Titolo</xsl:param>

    <xsl:param name="chart">S</xsl:param>

    <xsl:param name="timeout">0</xsl:param>

    <xsl:param name="opendata">N</xsl:param>

	<xsl:variable name="countSimboliL1"><xsl:value-of select="count(/CONS/C0/C1[@SIMBOLO!=''])" /></xsl:variable>
    <xsl:param name="immaginiL1">
		<xsl:choose>
			<xsl:when test="$countSimboliL1 = 0">N</xsl:when>
			<xsl:otherwise>S</xsl:otherwise>
		</xsl:choose>	
	</xsl:param>
	<xsl:param name="immaginiL2">S</xsl:param>
	
    <xsl:param name="vissolosind"><xsl:value-of select="/CONS/@VOTISOLOLIV1DETT"/></xsl:param>
    <xsl:param name="visvotiliste">N</xsl:param>    
    
    <xsl:variable name="logo">images/<xsl:value-of select="/CONS/@NOMESTEMMA"/></xsl:variable>
	<xsl:variable name="countAlle"><xsl:value-of select="count(/CONS/C0/C1/A1)" /></xsl:variable>
	

    <xsl:decimal-format name="perc" NaN="0%" infinity="0"/>

    <xsl:include href="common.xsl"/>

    <xsl:template match="/CONS">
        <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;</xsl:text>
        <html>
            <head>
				<xsl:call-template name="HEAD"/>
                <style>
					body { position: relative; } 
					
					.anchor {display: block; position: relative; top: -50px; visibility: hidden;} 
					.affix { top: 75px; z-index: 2; } 
					.affix-top { top: initial; position: fixed; } 
					.nav-pills > li:hover,.nav-pills > li.active{z-index:99;}
                    .voti { font-size: 1.4em; max-width: 15%; } 
					.lista { padding-left:20px; line-height: 45px; vertical-align: middle; }
					
					a[href^="http://www.amcharts.com"] {
					font-size:0.5em !important;
					}
					/* Custom, iPhone Retina */
					@media only screen and (min-width : 320px) {
						a.firefox{width:33%;}
					}

					/* Extra Small Devices, Phones */
					@media only screen and (min-width : 480px) {
					a.firefox{width:33%;}
					}

					/* Small Devices, Tablets */
					@media only screen and (min-width : 768px) {
					a.firefox{width:33%;}
					}

					/* Medium Devices, Desktops */
					@media only screen and (min-width : 992px) {
					a.firefox{width:20%;}
					}

					/* Large Devices, Wide Screens */
					@media only screen and (min-width : 1200px) {
					a.firefox{width:10%;}
					}



					/*==========  Non-Mobile First Method  ==========*/

					/* Large Devices, Wide Screens */
					@media only screen and (max-width : 1200px) {
					a.firefox{width:20%;}
					}

					/* Medium Devices, Desktops */
					@media only screen and (max-width : 992px) {
					a.firefox{width:20%;}
					}

					/* Small Devices, Tablets */
					@media only screen and (max-width : 768px) {
					a.firefox{width:33%;}
					}

					/* Extra Small Devices, Phones */
					@media only screen and (max-width : 480px) {
					a.firefox{width:33%;}
					}

					/* Custom, iPhone Retina */
					@media only screen and (max-width : 320px) {
					a.firefox{width:33%;}
					}
				</style>
            </head>
            <body>
                
                <xsl:if test="/CONS/@LIVELLO ='3'">

                    <xsl:attribute name="data-spy">scroll</xsl:attribute>

                    <xsl:attribute name="data-target">#myScrollspy</xsl:attribute>

                    <xsl:attribute name="data-offset">80</xsl:attribute>
                </xsl:if>

                <xsl:call-template name="TOP"/>

                <xsl:call-template name="INTESTAZIONE"/>
				
                <div class="container-fluid" id="dati">

                    <xsl:choose>

                        <xsl:when test="/CONS/@LIVELLO = 1">
                            <xsl:apply-templates mode="LIVELLO1"/>
                        </xsl:when>

                        <xsl:when test="/CONS/@LIVELLO = 2">
                            <xsl:apply-templates mode="LIVELLO2"/>
                        </xsl:when>

                        <xsl:when test="/CONS/@LIVELLO = 3">
                            <xsl:apply-templates mode="LIVELLO3"/>
                        </xsl:when>
                    </xsl:choose>
                    <xsl:if test="(/CONS/@LIVELLO = '1' or /CONS/@LIVELLO = '2') and /CONS/@CHART = 'S'">
                        <xsl:call-template name="CHART"/>
                    </xsl:if>
                    <div id="info">

                        <xsl:attribute name="class">well well-sm text-center</xsl:attribute>
                        <xsl:choose>
                            <xsl:when test="/CONS/@TIPOPERC = 'VV' or (/CONS/@LIVELLO = 2 and /CONS/@TURNO = 'BALL')">
								<xsl:if test="/CONS/@LIVELLO != 3">Le percentuali dei voti sono calcolate sul totale dei voti validi</xsl:if>
								<xsl:if test="/CONS/@LIVELLO = 3">Le percentuali delle preferenze sono calcolate sul totale delle preferenze ai candidati della <xsl:value-of select="/CONS/@DESC_LIV2_SING"/></xsl:if>
							</xsl:when>
                            <xsl:otherwise>Le percentuali dei voti sono calcolate sul totale votanti</xsl:otherwise>
                        </xsl:choose>
						<xsl:if  test="/CONS/@LIVELLO != 3">
							<xsl:if test="/CONS/@TIPOPERC = 'VV'">
								<br/>Le percentuali dei voti non validi sono calcolate sul totale votanti
							</xsl:if>
								<br/>La percentuale dei votanti è calcolata sugli iscritti
						</xsl:if>  
						<xsl:if test="/CONS/@LIVELLO != 2 or /CONS/@TURNO != 'BALL'">
							<xsl:if test="/CONS/@VOTMFDIVISISEZ = 'S'">
								<br/>Le percentuali dei votanti maschi e femmine sono calcolate rispetto al totale dei votanti.
							</xsl:if>
							<xsl:if test="/CONS/@VOTANTISEZSCRU = 'S'">
								<br/>Gli elettori iscritti, i votanti e la relativa percentuale sono conteggiati solo per le sezioni scrutinate
							</xsl:if>
						</xsl:if>
						<xsl:if test="/CONS/@LIVELLO = 2 and /CONS/@TURNO = 'BALL'">
							<br/>I voti alle liste sono quelli ottenuti al primo turno, i raggruppamenti sono quelli del ballottaggio
						</xsl:if>
                    </div>
                </div>
                <script src="include/jquery.min.js"></script>
                <script>
                    window.jQuery || document.write('&lt;script src="include/jquery.min.js"&gt;&lt;\/script&gt;')
                </script>
                <script src="include/bootstrap.min.js"></script>

                <xsl:if test="/CONS/@LIVELLO = 3">
                    <script>
                      $("#myScrollspy ul").mouseenter(function() {
                          $('#myScrollspy').off('activate.bs.scrollspy');
                      });
                      $("#myScrollspy ul").mouseleave(function() {
                        $('#myScrollspy').on('activate.bs.scrollspy', function() {
                            $('li.active')[0].scrollIntoView(true);
                        });
                      });
                      $('#myScrollspy').on('activate.bs.scrollspy', function() {
                          $('li.active')[0].scrollIntoView(true);
                      });
                      $(document).ready(function() {
                          $("#noScrollspy btn").click(function() {
                              $('#firediv').fadeToggle();
                              return true;
                          });
                          $("a.firefox").click(function() {
                              $('#firediv').fadeToggle();
                              return true;
                          });
                          $(window).resize(function() {
                              $("#firediv").css("max-height", window.innerHeight - 100);
                              //$("a.firefox").height($("a.firefox").width());
                          });
                          $("#firediv").css("max-height", window.innerHeight - 100);
                          //$("a.firefox").height($("a.firefox").width());
                      });
                    </script>
                </xsl:if>

                <xsl:if test="$banner = 'S'">
                    <script src="include/banner.js"></script>
                </xsl:if>
            </body>
        </html>
    </xsl:template>

    <xsl:template match="SV" mode="LIVELLO1">
        <table class="table table-bordered table-hover tabella">

            <xsl:if test="/CONS/@LIV_DETT!='TOT'">
                <caption>
                    <h3 class="text-center">

                        <xsl:value-of select="@NOME"/>&#160;
                        <small>
                            <xsl:value-of select="@UBICAZIONE"/>
                        </small>
                    </h3>
                </caption>
            </xsl:if>
            <thead>
                <tr>
                    <th>
                        <xsl:value-of select="/CONS/@DESC_LIV1_SING"/>
                    </th>
                    <th>
                        <xsl:attribute name="colspan">
                            <xsl:choose><xsl:when test="(/CONS/@TURNO != 'BALL' and ($vissolosind='S' or $visvotiliste='S'))">2</xsl:when>
                            <xsl:otherwise>3</xsl:otherwise></xsl:choose>
                        </xsl:attribute>
                        Voti
                    </th>
                    <xsl:if test="/CONS/@TURNO != 'BALL'">
                        <xsl:if test="$vissolosind='S'">
                            <th>Voti solo <xsl:value-of select="/CONS/@DESC_LIV1_BREVE_SING"/></th>
                        </xsl:if>
                        <xsl:if test="$visvotiliste='S'">
                            <th>Voti coalizione</th>
                        </xsl:if>
                    </xsl:if>
                    <xsl:if test="/CONS/@ALLEGATI = 'S' and $countAlle != '0'">
                      <th>Allegati</th>
                    </xsl:if>
                </tr>
            </thead>
            <tbody>
                <xsl:apply-templates mode="LIVELLO1TR"/>
            </tbody>
            <tfoot>
                <tr>
                    <th>TOTALE</th>
                    <td>
                        <xsl:attribute name="colspan">
                            <xsl:choose><xsl:when test="(/CONS/@TURNO != 'BALL' and ($vissolosind='S' or $visvotiliste='S'))">2</xsl:when>
                            <xsl:otherwise>3</xsl:otherwise></xsl:choose>
                        </xsl:attribute>
                        <xsl:attribute name="class">text-center</xsl:attribute>
                        <xsl:value-of select="@VOTIVALIDI_C1"/>
                    </td>
                    <xsl:if test="/CONS/@TURNO != 'BALL'">
                        <xsl:if test="$vissolosind='S'">
                            <td>
                                <xsl:attribute name="class">text-center</xsl:attribute>
                                <xsl:value-of select="@VOTI_SOLO_C1"/>
                            </td>
                        </xsl:if>
                        <xsl:if test="$visvotiliste='S'">
                            <td>
                                <xsl:attribute name="class">text-center</xsl:attribute>
                                <xsl:value-of select="@VOTIVALIDI_C2"/>
                            </td>
                        </xsl:if>
                    </xsl:if>
                </tr>
                <tr>
                    <td colspan="5">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-sm-12 col-md-6 col-lg-3 text-center">Schede bianche:

                                    <xsl:value-of select="@BIANCHE"/>
                                    (<xsl:value-of select="format-number(@BIANCHE div @TOTVOT,'#0.##%','perc')"/>)</div>

                                <xsl:choose>

                                    <xsl:when test="/CONS/@NONVALIDI='N' and /CONS/@NASCONDI_VOTINULLI = 'N'">
                                        <div class="col-sm-12 col-md-6 col-lg-3 text-center">Schede nulle:

                                            <xsl:value-of select="@NULLE"/>
                                            (<xsl:value-of select="format-number(@NULLE div @TOTVOT,'#0.##%','perc')"/>)</div>
                                        <div class="col-sm-12 col-md-6 col-lg-3 text-center">Voti nulli:

                                            <xsl:value-of select="@VOTI_NULLI"/>
                                            (<xsl:value-of select="format-number(@VOTI_NULLI div @TOTVOT,'#0.##%','perc')"/>)</div>
                                    </xsl:when>

                                    <xsl:otherwise>
                                        <div class="col-sm-12 col-md-6 col-lg-6 text-center">Schede nulle:

                                            <xsl:value-of select="@VOTI_NULLI + @NULLE"/>
                                            (<xsl:value-of select="format-number((@VOTI_NULLI+@NULLE) div @TOTVOT,'#0.##%','perc')"/>)</div>
                                    </xsl:otherwise>
                                </xsl:choose>
                                <div class="col-sm-12 col-md-6 col-lg-3 text-center">Voti contestati non assegnati:

                                    <xsl:value-of select="@VCNAS_TOT"/>
                                    (<xsl:value-of select="format-number(@VCNAS_TOT div @TOTVOT,'#0.##%','perc')"/>)</div>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="5">
                        <div class="container-fluid">
                            <div class="row">

                                <xsl:choose>

                                    <xsl:when test="/CONS/@VOTMFDIVISISEZ = 'S'">
                                        <div class="col-sm-12 col-md-6 col-lg-3 text-center">Votanti maschi:

                                            <xsl:value-of select="@TOTVOTM"/>
                                            (<xsl:value-of select="format-number(@TOTVOTM div @ELETTORI,'#0.##%','perc')"/>)</div>
                                        <div class="col-sm-12 col-md-6 col-lg-3 text-center">Votanti femmine:

                                            <xsl:value-of select="@TOTVOTF"/>
                                            (<xsl:value-of select="format-number(@TOTVOTF div @ELETTORI,'#0.##%','perc')"/>)</div>
                                        <div class="col-sm-12 col-md-6 col-lg-3 text-center">Votanti:

                                            <xsl:value-of select="@TOTVOT"/>
                                            (<xsl:value-of select="format-number(@TOTVOT div @ELETTORI,'#0.##%','perc')"/>)</div>
                                        <div class="col-sm-12 col-md-6 col-lg-3 text-center">Iscritti:

                                            <xsl:value-of select="@ELETTORI"/>
                                        </div>
                                    </xsl:when>

                                    <xsl:otherwise>
                                        <div class="col-sm-12 col-md-6 col-lg-6 text-center">Votanti:

                                            <xsl:value-of select="@TOTVOT"/>
                                            (<xsl:value-of select="format-number(@TOTVOT div @ELETTORI,'#0.##%','perc')"/>)</div>
                                        <div class="col-sm-12 col-md-6 col-lg-6 text-center">Iscritti:

                                            <xsl:value-of select="@ELETTORI"/>
                                        </div>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    </xsl:template>

    <xsl:template match="V1" mode="LIVELLO1TR">
        <xsl:variable name="numero">
            <xsl:value-of select="@NUMERO"/>
        </xsl:variable>
        <tr>
            <!-- Immagine del simbolo della lista -->
            <td>


                <xsl:if test="($immaginiL1='S')">

                    <xsl:if test="(/CONS/C0/C1[@NUMERO=$numero]/@SIMBOLO!='')">
                        <img>

                            <xsl:attribute name="src">images/simboli/<xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@SIMBOLO"/></xsl:attribute>

                            <xsl:attribute name="alt">Simbolo di

                                <xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@SIGLA"/>
                            </xsl:attribute>

                            <xsl:attribute name="class">pull-left</xsl:attribute>

                            <xsl:attribute name="height">96</xsl:attribute>

                            <xsl:attribute name="width">96</xsl:attribute>
                        </img>
                    </xsl:if>
                </xsl:if>
                <!-- Nome esteso della lista -->
                <div>

                    <xsl:attribute name="class">lead</xsl:attribute>
					<xsl:if test="($immaginiL1='S')">
						<xsl:attribute name="style">padding-left:105px;</xsl:attribute>
					</xsl:if>
                    <strong>
                        <xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@NOME"/>
                    </strong>
                </div>

                <xsl:if test="(/CONS/@VISNOMEPRES_REG='S')">
                    <div>

                        <xsl:attribute name="style"><xsl:if test="($immaginiL1='S')">padding-left:105px;</xsl:if>margin-top:-20px;margin-bottom:10px</xsl:attribute>
                        Candidato Presidente:

                        <xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@PRESIDENTE"/>
                    </div>
                </xsl:if>
                <div>

                    <xsl:attribute name="class">container-fluid</xsl:attribute>
 
                    <xsl:attribute name="style">
						<xsl:if test="($immaginiL1='S')">  
							overflow:hidden;
							<xsl:choose>
								<xsl:when test="/CONS/C0/C1[@NUMERO=$numero]/@SIMBOLO!=''">padding-left:30px;</xsl:when>
								<xsl:otherwise>padding-left:125px;</xsl:otherwise>
							</xsl:choose>	
						</xsl:if>							
					</xsl:attribute>

                    <xsl:for-each select="/CONS/C0/C1[@NUMERO=$numero]/C2">

                        <xsl:if test="(@SIMBOLO!='')">
                            <img>

                                <xsl:attribute name="src">images/simboli/<xsl:value-of select="@SIMBOLO"/></xsl:attribute>

                                <xsl:attribute name="alt">Simbolo di

                                    <xsl:value-of select="@SIGLA"/>
                                </xsl:attribute>

                                <xsl:attribute name="title">
                                    <xsl:value-of select="@NOME"/>
                                </xsl:attribute>

                                <xsl:attribute name="class">pull-left</xsl:attribute>

                                <xsl:attribute name="height">48</xsl:attribute>

                                <xsl:attribute name="width">48</xsl:attribute>
                            </img>
                        </xsl:if>
                    </xsl:for-each>
                </div>
            </td>
            <!-- Voti validi alla lista -->

            <xsl:variable name="percentualeVoti">

                <xsl:choose>

                    <xsl:when test="/CONS/@TIPOPERC = 'VV'">
                        <xsl:value-of select="@VOTIVALIDI_C1 div (../@TOT_VOTIVALIDI_C1)"/>
                    </xsl:when>

                    <xsl:otherwise>
                        <xsl:value-of select="@VOTIVALIDI_C1 div (../../@TOTVOT)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <td>
                <xsl:attribute name="class">text-center</xsl:attribute>
                <span class="voti">
                    <xsl:value-of select="@VOTIVALIDI_C1"/>&#160;
                </span>
                <xsl:if test="(/CONS/@TURNO != 'BALL' and ($vissolosind='S' or $visvotiliste='S'))">
                    <br/>
                    <xsl:value-of select="format-number($percentualeVoti,'#0.##%', 'perc')"/>
                </xsl:if>
            </td>
            <xsl:if test="(/CONS/@TURNO = 'BALL' or ($vissolosind!='S' and $visvotiliste!='S'))">
                <td>
                    <xsl:attribute name="class">text-center</xsl:attribute>
                    <xsl:value-of select="format-number($percentualeVoti,'#0.##%', 'perc')"/>
                </td>
            </xsl:if>
            <td style="width:40%">
                <xsl:variable name="percentualeBarra" select="@VOTIVALIDI_C1 div ../../@MAXVOTVAL"/>
                <div class="progress" style="margin-bottom:0px">
                    <div class="progress-bar" role="progressbar" aria-valuenow="{format-number($percentualeVoti*100,'#0.##', 'perc')}" aria-valuemin="0" aria-valuemax="100" style="width:{format-number($percentualeVoti,'#0.##%', 'perc')};">
                        <span class="sr-only">
                            <xsl:value-of select="format-number($percentualeVoti,'#0.##%', 'perc')"/>
                        </span>
                    </div>
                </div>
            </td>
            <xsl:if test="/CONS/@TURNO != 'BALL'">
                <xsl:if test="$vissolosind='S'">
                    <xsl:variable name="percentualeVoti2">
                        <xsl:choose>
                            <xsl:when test="/CONS/@TIPOPERC = 'VV'">
                                <xsl:value-of select="@VOTISOLO_C1 div (../@TOT_VOTIVALIDI_C1)"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="@VOTISOLO_C1 div (../../@TOTVOT)"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <td>
                        <xsl:attribute name="class">text-center</xsl:attribute>
                        <span class="voti">
                            <xsl:value-of select="@VOTISOLO_C1"/>&#160;
                        </span>
                        <br/>
                        <xsl:value-of select="format-number($percentualeVoti2,'#0.##%', 'perc')"/>
                    </td>
                </xsl:if>
                <xsl:if test="$visvotiliste='S'">
                    <td>
                        <xsl:variable name="percentualeVoti3">
                            <xsl:choose>
                                <xsl:when test="/CONS/@TIPOPERC = 'VV'">
                                    <xsl:value-of select="@TOT_VOTIVALIDI_C2 div (../../@VOTIVALIDI_C2)"/>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="@TOT_VOTIVALIDI_C2 div (../../@TOTVOT)"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:variable>
                        <xsl:attribute name="class">text-center</xsl:attribute>
                        <span class="voti">
                            <xsl:value-of select="@TOT_VOTIVALIDI_C2"/>&#160;
                        </span>
                        <br/>
                        <xsl:value-of select="format-number($percentualeVoti3,'#0.##%', 'perc')"/>
                    </td>
                </xsl:if>
            </xsl:if>
            <xsl:if test="/CONS/@ALLEGATI = 'S' and $countAlle != '0'">
              <td class="text-center" style="padding:4px">
                <xsl:for-each select="/CONS/C0/C1[@NUMERO=$numero]/A1">
					<xsl:if test="@NOME != ''">
					    <a style="text-align: center;">
							<xsl:if test="@TIPO != 'CP'">
						        <xsl:attribute name="title">
									<xsl:value-of select="@DESC"/>&#160;&#13;<xsl:value-of select="@NOME"/>
								</xsl:attribute>
						    </xsl:if>
						    <xsl:if test="@TIPO = 'CP'">
						      <xsl:attribute name="title">Certificato Elettorale del Casellario Giudiziale&#13;<xsl:value-of select="@NOME"/></xsl:attribute>
						    </xsl:if>
					        <xsl:attribute name="href">allegati/<xsl:value-of select="@NOME"/></xsl:attribute>
					        <xsl:attribute name="target">_blank</xsl:attribute>
					        <xsl:attribute name="style">padding-right:10px;display:inline-block;</xsl:attribute>
					        <xsl:choose>
						        <xsl:when test="@SIMBOLO != ''">
							        <img style="vertical-align: baseline;">
										<xsl:attribute name="src">images/<xsl:value-of select="@SIMBOLO"/></xsl:attribute>
								        <!--<xsl:attribute name="class">pull-left</xsl:attribute>-->
								        <xsl:attribute name="height">40</xsl:attribute>
								        <xsl:attribute name="width">40</xsl:attribute>
							        </img>
						        </xsl:when>
						        <xsl:otherwise>
						        <h5 style="word-break: break-word; text-align:center; max-width: 100px; font-size: 13px" >
							        <xsl:if test="@TIPO = 'CP'">
								        Certificato Elettorale del Casellario Giudiziale
							        </xsl:if>
							        <xsl:if test="@TIPO != 'CP'">
								        <xsl:value-of select="@DESC"/>
							        </xsl:if>
						        </h5>
						        </xsl:otherwise>
					        </xsl:choose>
					    </a>
				  </xsl:if>
                </xsl:for-each>
              </td>
            </xsl:if>
        </tr>
    </xsl:template>

    <xsl:template match="SV" mode="LIVELLO2">
        <table>

            <xsl:attribute name="class">table table-bordered table-hover tabella</xsl:attribute>

            <xsl:if test="/CONS/@LIV_DETT!='TOT'">
                <caption>
                    <h3 class="text-center">

                        <xsl:value-of select="@NOME"/>&#160;
                        <small>
                            <xsl:value-of select="@UBICAZIONE"/>
                        </small>
                    </h3>
                </caption>
            </xsl:if>
            <thead>
                <tr>
                    <th>
                        <xsl:value-of select="/CONS/@DESC_LIV2_SING"/>
                    </th>
                    <th colspan="3">Voti</th>
					<xsl:if test="/CONS/@ALLEGATI = 'S' and $countAlle != '0'">
                      <th>Allegati</th>
                    </xsl:if>
                </tr>
            </thead>
            <tbody>
                <xsl:apply-templates mode="LIVELLO2TR"/>
            </tbody>
			<tfoot>
				<tr>
					<th>TOTALE</th>
					<td colspan="3">
						<xsl:attribute name="class">text-center</xsl:attribute>
						<xsl:value-of select="@VOTIVALIDI_C1"/>
					</td>
				</tr>
				<xsl:if test="/CONS/@TURNO != 'BALL'">
					<tr>
						<td colspan="4">
							<div class="container-fluid">
								<div class="row">
									<xsl:variable name="colVotiNulli" select="translate(/CONS/@NONVALIDI,'SN','01')"/>
									<xsl:variable name="colVotiSolo" select="translate(/CONS/@GESTIONELIV1,'SN','10')"/>
									<xsl:variable name="colVotiNulliL2" select="translate(/CONS/@VOTINULLILIV2,'SN','10')"/>
									<xsl:variable name="numColonne" select="3 + $colVotiNulli + $colVotiSolo + $colVotiNulliL2"/>
									<xsl:variable name="marginBottom" select="translate($numColonne,'3456','0555')"/>
									<xsl:variable name="marginBottom2" select="translate($numColonne,'3456','0055')"/>
									<xsl:variable name="dimColonnaR1">col-sm-12 col-md-6 col-lg-<xsl:value-of select="translate($numColonne,'3456','4644')"/> text-center</xsl:variable>
									<xsl:variable name="dimColonnaR2">col-sm-12 col-md-6 col-lg-<xsl:value-of select="translate($numColonne,'3456','4664')"/> text-center</xsl:variable>
									<div class="{$dimColonnaR1}" style="margin-bottom: {$marginBottom}px;">
										Schede bianche: <xsl:value-of select="@BIANCHE"/>
										(<xsl:value-of select="format-number(@BIANCHE div @TOTVOT,'#0.##%','perc')"/>)
									</div>
									<div class="{$dimColonnaR1}" style="margin-bottom: {$marginBottom}px;">
										Voti contestati non assegnati: <xsl:value-of select="@VCNAS_TOT"/>
										(<xsl:value-of select="format-number(@VCNAS_TOT div @TOTVOT,'#0.##%','perc')"/>)
									</div>
									<xsl:choose>
										<xsl:when test="/CONS/@NONVALIDI='N'">
											<div class="{$dimColonnaR1}" style="margin-bottom: {$marginBottom}px;">
												Schede nulle: <xsl:value-of select="@NULLE"/>
												(<xsl:value-of select="format-number(@NULLE div @TOTVOT,'#0.##%','perc')"/>)
											</div>
											<div class="{$dimColonnaR2}">
												Voti nulli: <xsl:value-of select="@VOTI_NULLI"/>
												(<xsl:value-of select="format-number(@VOTI_NULLI div @TOTVOT,'#0.##%','perc')"/>)
											</div>
										</xsl:when>
										<xsl:otherwise>
											<div class="{$dimColonnaR1}" style="margin-bottom: {$marginBottom2}px;">
												Schede nulle: <xsl:value-of select="@VOTI_NULLI + @NULLE"/>
												(<xsl:value-of select="format-number((@VOTI_NULLI+@NULLE) div @TOTVOT,'#0.##%','perc')"/>)
											</div>
										</xsl:otherwise>
									</xsl:choose>
									<xsl:if test="/CONS/@GESTIONELIV1 = 'S'">
										<div class="{$dimColonnaR2}">
											Voti solo <xsl:value-of select="/CONS/@DESC_LIV1_BREVE"/>: <xsl:value-of select="@VOTI_SOLO_C2"/>
											(<xsl:value-of select="format-number(@VOTI_SOLO_C2 div @TOTVOT,'#0.##%','perc')"/>)
										</div>
									</xsl:if>
									<xsl:if test="/CONS/@VOTINULLILIV2 = 'S'">
											<div class="{$dimColonnaR2}">
												Voti nulli <xsl:value-of select="/CONS/@DESC_LIV2_BREVE"/>: <xsl:value-of select="@VOTI_NULLI_SOLO_L2"/>
												(<xsl:value-of select="format-number(@VOTI_NULLI_SOLO_L2 div (@TOTVOT),'0.##%', 'perc')"/>)
											</div>
									</xsl:if>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td colspan="5">
							<div class="container-fluid">
								<div class="row">

									<xsl:choose>

										<xsl:when test="/CONS/@VOTMFDIVISISEZ = 'S'">
											<div class="col-sm-12 col-md-6 col-lg-3 text-center">Votanti maschi:

												<xsl:value-of select="@TOTVOTM"/>
												(<xsl:value-of select="format-number(@TOTVOTM div @ELETTORI,'#0.##%','perc')"/>)</div>
											<div class="col-sm-12 col-md-6 col-lg-3 text-center">Votanti femmine:

												<xsl:value-of select="@TOTVOTF"/>
												(<xsl:value-of select="format-number(@TOTVOTF div @ELETTORI,'#0.##%','perc')"/>)</div>
											<div class="col-sm-12 col-md-6 col-lg-3 text-center">Votanti:

												<xsl:value-of select="@TOTVOT"/>
												(<xsl:value-of select="format-number(@TOTVOT div @ELETTORI,'#0.##%','perc')"/>)</div>
											<div class="col-sm-12 col-md-6 col-lg-3 text-center">Iscritti:

												<xsl:value-of select="@ELETTORI"/>
											</div>
										</xsl:when>

										<xsl:otherwise>
											<div class="col-sm-12 col-md-6 col-lg-6 text-center">Votanti:

												<xsl:value-of select="@TOTVOT"/>
												(<xsl:value-of select="format-number(@TOTVOT div @ELETTORI,'#0.##%','perc')"/>)</div>
											<div class="col-sm-12 col-md-6 col-lg-6 text-center">Iscritti:

												<xsl:value-of select="@ELETTORI"/>
											</div>
										</xsl:otherwise>
									</xsl:choose>
								</div>
							</div>
						</td>
					</tr>
				</xsl:if>
			</tfoot>
        </table>
    </xsl:template>

    <xsl:template match="V1" mode="LIVELLO2TR">
        <!-- livello V1 -->
        <xsl:variable name="numero">
            <xsl:value-of select="@NUMERO"/>
        </xsl:variable>
        <xsl:variable name="posizione">
            <xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@POSIZIONE"/>
        </xsl:variable>
        
        <xsl:variable name="numero_C2_prec">
            <xsl:value-of select="/CONS/C0/C1[@POSIZIONE = ($posizione - 1)]/@NUMERO_C2"/>
        </xsl:variable>
        <xsl:variable name="numero_C2">
            <xsl:value-of select="/CONS/C0/C1[@POSIZIONE = $posizione]/@NUMERO_C2"/>
        </xsl:variable>
        
        <xsl:if test="($numero_C2 != $numero_C2_prec) and (/CONS/@NUMABITANTI &gt; 15000)">
            <xsl:if test="$numero_C2_prec != ''">
                <tr>
                  <xsl:variable name="votiCoalizione">
                      <xsl:value-of select="sum(../V1[@NUMERO=/CONS/C0/C1[@NUMERO_C2=$numero_C2_prec]/@NUMERO]/@VOTIVALIDI_C1)"/>
                  </xsl:variable>
                  
                  <xsl:variable name="percentualeCoal">
                      <xsl:choose>
                          <xsl:when test="/CONS/@TIPOPERC = 'VV' or /CONS/@TURNO = 'BALL'">
                              <xsl:value-of select="$votiCoalizione div (../@TOT_VOTIVALIDI_C1)"/>
                          </xsl:when>
                          <xsl:otherwise>
                              <xsl:value-of select="$votiCoalizione div (../../@TOTVOT)"/>
                          </xsl:otherwise>
                      </xsl:choose>
                  </xsl:variable>
                  
                  <td style="text-align:right;">
                      Totale coalizione
                  </td>
                  <td>
                      <xsl:attribute name="class">text-center</xsl:attribute>
                      <span class="voti">
                          <xsl:value-of select="$votiCoalizione"/>&#160;
                      </span>
                  </td>
                  <td class="text-center">
                      <xsl:value-of select="format-number($percentualeCoal,'#0.##%', 'perc')"/>
                  </td>
                </tr>
            </xsl:if>
            <!-- Metto il nome del candidato di livello 1 -->
            <tr>
              <td colspan="4" style="font-weight: bold;">
				<xsl:choose>
				  <xsl:when test="$numero_C2 = ''">
						Altre liste
				  </xsl:when>
				  <xsl:otherwise>
					  <xsl:value-of select="/CONS/C0/C1/C2[@NUMERO=$numero_C2]/@NOME"/>
				  </xsl:otherwise>
				</xsl:choose>
              </td>
            </tr>
        </xsl:if>
        <tr>
            <!-- Immagine del simbolo della lista -->
            <td>

                <div>

                    <xsl:if test="($immaginiL2='S')">

                        <xsl:if test="(/CONS/C0/C1[@NUMERO=$numero]/@SIMBOLO!='')">
                            <img>

                                <xsl:attribute name="src">images/simboli/<xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@SIMBOLO"/></xsl:attribute>

                                <xsl:attribute name="alt">Simbolo di

                                    <xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@SIGLA"/>
                                </xsl:attribute>

                                <xsl:attribute name="class">pull-left</xsl:attribute>

                                <xsl:attribute name="height">45</xsl:attribute>

                                <xsl:attribute name="width">45</xsl:attribute>
                            </img>
                        </xsl:if>
                    </xsl:if>
                    <span>

                        <xsl:attribute name="class">lista</xsl:attribute>

                        <xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@NOME"/>
                    </span>
                </div>
            </td>
            <!-- Voti validi alla lista -->

            <xsl:variable name="percentualeVoti">

                <xsl:choose>

                    <xsl:when test="/CONS/@TIPOPERC = 'VV' or /CONS/@TURNO = 'BALL'">
                        <xsl:value-of select="@VOTIVALIDI_C1 div (../@TOT_VOTIVALIDI_C1)"/>
                    </xsl:when>

                    <xsl:otherwise>
                        <xsl:value-of select="@VOTIVALIDI_C1 div (../../@TOTVOT)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <td>
                <xsl:attribute name="class">text-center</xsl:attribute>
                <span class="voti">

                    <xsl:value-of select="@VOTIVALIDI_C1"/>&#160;
                </span>
            </td>
            <td class="text-center">
                <xsl:value-of select="format-number($percentualeVoti,'#0.##%', 'perc')"/>
            </td>
            <td style="width:40%">

                <xsl:variable name="percentualeBarra" select="@VOTIVALIDI_C1 div ../../@MAXVOTVAL"/>
                <div class="progress" style="margin-bottom:0px">
                    <div class="progress-bar" role="progressbar" aria-valuenow="{format-number($percentualeVoti*100,'#0.##', 'perc')}" aria-valuemin="0" aria-valuemax="100" style="width:{format-number($percentualeVoti,'#0.##%', 'perc')};">
                        <span class="sr-only">
                            <xsl:value-of select="format-number($percentualeVoti,'#0.##%', 'perc')"/>
                        </span>
                    </div>
                </div>
            </td>
			
			<!--Allegati lista-->
			<xsl:if test="/CONS/@ALLEGATI = 'S' and $countAlle != '0'">
				<td class="text-center" style="padding:4px">
					<xsl:for-each select="/CONS/C0/C1[@NUMERO=$numero]/A1">
						<xsl:if test="@NOME != ''">
							<a style="text-align: center;">
								<xsl:if test="@TIPO != 'CP'">
									<xsl:attribute name="title">
										<xsl:value-of select="@DESC"/>&#160;&#13;<xsl:value-of select="@NOME"/>
									</xsl:attribute>
								</xsl:if>
								<xsl:if test="@TIPO = 'CP'">
									<xsl:attribute name="title">
										Certificato Elettorale del Casellario Giudiziale&#13;<xsl:value-of select="@NOME"/>
									</xsl:attribute>
								</xsl:if>
								<xsl:attribute name="href">allegati/<xsl:value-of select="@NOME"/></xsl:attribute>
								<xsl:attribute name="target">_blank</xsl:attribute>
								<xsl:attribute name="style">padding-right:10px;display:inline-block;</xsl:attribute>
								<xsl:choose>
									<xsl:when test="@SIMBOLO != ''">
										<img style="vertical-align: baseline;">
											<xsl:attribute name="src">images/<xsl:value-of select="@SIMBOLO"/></xsl:attribute>
											<!--<xsl:attribute name="class">pull-left</xsl:attribute>-->
											<xsl:attribute name="height">32</xsl:attribute>
											<xsl:attribute name="width">32</xsl:attribute>
										</img>
									</xsl:when>
									<xsl:otherwise>
										<h5 style="word-break: break-word; text-align:center; max-width: 100px; font-size: 11px" >
											<xsl:if test="@TIPO = 'CP'">
												Certificato Elettorale del Casellario Giudiziale
											</xsl:if>
											<xsl:if test="@TIPO != 'CP'">
												<xsl:value-of select="@DESC"/>
											</xsl:if>
										</h5>
									</xsl:otherwise>
								</xsl:choose>
							</a>
						</xsl:if>
					</xsl:for-each>
				</td>
			</xsl:if>
        </tr>
        <xsl:if test="$posizione = count(/CONS/C0/C1) and (/CONS/@NUMABITANTI &gt; 15000) and $numero_C2 != ''">
            <tr>
                <xsl:variable name="votiCoalizione">
                    <xsl:value-of select="sum(../V1[@NUMERO=/CONS/C0/C1[@NUMERO_C2=$numero_C2]/@NUMERO]/@VOTIVALIDI_C1)"/>
                </xsl:variable>
                    
                <xsl:variable name="percentualeCoal">
                    <xsl:choose>
                        <xsl:when test="/CONS/@TIPOPERC = 'VV' or /CONS/@TURNO = 'BALL'">
                            <xsl:value-of select="$votiCoalizione div (../@TOT_VOTIVALIDI_C1)"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$votiCoalizione div (../../@TOTVOT)"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                
                <td style="text-align:right;">
                    Totale coalizione
                </td>
                <td>
                    <xsl:attribute name="class">text-center</xsl:attribute>
                    <span class="voti">
                        <xsl:value-of select="$votiCoalizione"/>&#160;
                    </span>
                </td>
                <td class="text-center">
                    <xsl:value-of select="format-number($percentualeCoal,'#0.##%', 'perc')"/>
                </td>
            </tr>
        </xsl:if>
    </xsl:template>

    <xsl:template match="SV" mode="LIVELLO3">
        <div id="firediv" style="display:none;z-index:99;background-color:rgba(255,255,255,.6);padding:10px;position:fixed;top:70px;min-width:80%;max-width:90%;left:10%;overflow-y:auto;">
            <xsl:for-each select="/CONS/C0">
                <a href="#L{@NUMERO}" class="firefox" style="padding:0px;display:inline-block;">
                    <img style="height:96px;" src="images/simboli/{@SIMBOLO}" alt="{@NOME}" title="{@NOME}"/>
                </a>
            </xsl:for-each>
        </div>
        <div class="row">
            <nav class="col-xs-2 col-sm-2 col-md-2 col-lg-1" id="myScrollspy" style="padding:0px 0px 0px 0px;">
                <ul class="nav nav-stacked nav-pills" style="width:inherit;max-height:90%;background-color:white;overflow-y:auto;overflow-x:hidden" data-spy="affix" data-offset-top="100">
                    <xsl:for-each select="/CONS/C0">
                        <li>
                            <a href="#L{@NUMERO}" style="padding:4px;">
                                <img style="min-width:50%;max-width:80%;margin:0px auto;display:block" src="images/simboli/{@SIMBOLO}" alt="{@NOME}" title="{@NOME}"/>
                            </a>
                        </li>
                    </xsl:for-each>
                </ul>
            </nav>
            <div id="noScrollspy" class="col-xs-1" style="position:sticky;top:70px;z-index:99;"><btn class="btn btn-primary btn-large">Liste</btn></div>
            <script>
                if (document.body === null) {/*Siamo su firefox nascondi affix*/
                  var nodo = document.getElementById("myScrollspy");
                  if (nodo !== null)
                    nodo.parentNode.removeChild(nodo);
                }
                else {/*Siamo su altro nascondi lista*/
                  var nodo = document.getElementById("noScrollspy");
                  if (nodo !== null)
                    nodo.parentNode.removeChild(nodo);
                }
            </script>
            <div class="col-xs-10 col-sm-10 col-md-10 col-lg-10">
                <xsl:apply-templates mode="LIVELLO3TABLE"/>
            </div>
        </div>
    </xsl:template>

    <xsl:template match="V0" mode="LIVELLO3TABLE">

        <xsl:variable name="numerolist">
            <xsl:value-of select="@NUMERO"/>
        </xsl:variable>
        <a id="L{/CONS/C0[@NUMERO=$numerolist]/@NUMERO}" href="#" class="anchor"/>
        <div class="table-responsive">
            <table class="table table-bordered table-hover tabella">
                <caption>

                    <h3 class="text-center">
                        Lista: <xsl:value-of select="//CONS/C0[@NUMERO=$numerolist]/@NOME"/>
                    </h3>
                    <h4 class="text-center">Voti di lista: <xsl:value-of select="/CONS/SV/V0[@NUMERO=$numerolist]/@VOTIVALIDI_C0"/></h4>
					<xsl:choose>
						<xsl:when test="/CONS/@TIPO_VIS = '' and /CONS/@LINKSEZ='S'">
							<a href="{/CONS/@TURNO}SEZ_3_{/CONS/@COMUNE_ISTAT}{/CONS/@LIV_ZONA}_L{@NUMERO}.{/CONS/@ESTENS_PAG}" class="btn btn-link">Dettaglio per sezione</a>
						</xsl:when>
					</xsl:choose>
                </caption>
                <thead>
                    <tr>
                        <th>
                            <xsl:value-of select="/CONS/@DESC_LIV3_SING"/>
                        </th>
                        <th colspan="2">Preferenze</th>
                        <xsl:if test="/CONS/@ALLEGATI = 'S' and $countAlle != '0'">
                          <th>Allegati</th>
                        </xsl:if>
                    </tr>
                </thead>
                <tbody>

                    <xsl:choose>

                        <xsl:when test="/CONS/@ORDINAM_C1 = 'PROG'">
                            <xsl:apply-templates mode="LIVELLO3TR"/>
                        </xsl:when>

                        <xsl:otherwise>

                            <xsl:apply-templates mode="LIVELLO3TR">
                                <xsl:sort select="@VOTIVALIDI_C1" data-type="number" order="descending"/>
                            </xsl:apply-templates>
                        </xsl:otherwise>
                    </xsl:choose>
                </tbody>
                <tfoot>
	<tr>
		<th>
			Totale Preferenze</th>
		<th>
			<xsl:attribute name="class">text-center</xsl:attribute>
			<span class="voti">

				<xsl:value-of select="@TOT_VOTIVALIDI_C1"/>&#160;
			</span>
		</th>

		<xsl:variable name="percentualeVoti">

			<xsl:choose>

				<xsl:when test="/CONS/@TIPOPERC = 'VV'">
					<xsl:value-of select="@TOT_VOTIVALIDI_C1 div @TOT_VOTIVALIDI_C1"/>
				</xsl:when>

				<xsl:otherwise>
					<xsl:value-of select="@TOT_VOTIVALIDI_C1 div (../../@TOTVOT)"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<th>
			<xsl:value-of select="format-number($percentualeVoti,'#0.##%', 'perc')"/>
		</th>
	</tr>
</tfoot>
            </table>
        </div>
    </xsl:template>

    <xsl:template match="V1" mode="LIVELLO3TR">

        <xsl:variable name="numerocand">
            <xsl:value-of select="@NUMERO"/>
        </xsl:variable>

        <xsl:variable name="numerolist">
            <xsl:value-of select="../@NUMERO"/>
        </xsl:variable>
        <tr>
            <td>

                <xsl:attribute name="class">text-center</xsl:attribute>

                <xsl:value-of select="/CONS/C0[@NUMERO=$numerolist]/C1[@NUMERO=$numerocand]/@NOME"/>
            </td>

            <xsl:variable name="percentualeVoti">

                <xsl:choose>

                    <xsl:when test="/CONS/@TIPOPERC = 'VV'">
                        <xsl:value-of select="@VOTIVALIDI_C1 div (../@TOT_VOTIVALIDI_C1)"/>
                    </xsl:when>

                    <xsl:otherwise>
                        <xsl:value-of select="@VOTIVALIDI_C1 div (../../@TOTVOT)"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <td>

                <xsl:attribute name="class">text-center</xsl:attribute>
                <span class="voti">

                    <xsl:value-of select="@VOTIVALIDI_C1"/>&#160;
                </span>
            </td>
            <td class="text-center">
                <xsl:value-of select="format-number($percentualeVoti,'#0.##%', 'perc')"/>
            </td>
            <xsl:if test="/CONS/@ALLEGATI = 'S' and $countAlle != '0'">
              <td class="text-center" style="padding:4px">
                <xsl:for-each select="/CONS/C0[@NUMERO=$numerolist]/C1[@NUMERO=$numerocand]/A1">
					<xsl:if test="@NOME != ''">
					    <a style="text-align: center;">
						    <xsl:if test="@TIPO != 'CP'">
						      <xsl:attribute name="title"><xsl:value-of select="@DESC"/>&#160;&#13;<xsl:value-of select="@NOME"/></xsl:attribute>
						    </xsl:if>
						    <xsl:if test="@TIPO = 'CP'">
						      <xsl:attribute name="title">Certificato Elettorale del Casellario Giudiziale&#13;<xsl:value-of select="@NOME"/></xsl:attribute>
						    </xsl:if>
						    <xsl:attribute name="href">allegati/<xsl:value-of select="@NOME"/></xsl:attribute>
						    <xsl:attribute name="target">_blank</xsl:attribute>
						    <xsl:attribute name="style">padding-right:10px;display:inline-block;</xsl:attribute>
						    <xsl:choose>
						        <xsl:when test="@SIMBOLO != ''">
						            <img style="vertical-align: baseline;">
										<xsl:attribute name="src">images/<xsl:value-of select="@SIMBOLO"/></xsl:attribute>
							            <xsl:attribute name="height">32</xsl:attribute>
							            <xsl:attribute name="width">32</xsl:attribute>
						            </img>
						        </xsl:when>
						        <xsl:otherwise>
						            <h5 style="word-break: break-word; text-align:center; max-width: 100px; font-size: 11px" >
									    <xsl:if test="@TIPO = 'CP'">
										    Certificato Elettorale del Casellario Giudiziale
									    </xsl:if>
									    <xsl:if test="@TIPO != 'CP'">
										    <xsl:value-of select="@DESC"/>
									    </xsl:if>
								    </h5>
						        </xsl:otherwise>
					        </xsl:choose>
					      </a>
					</xsl:if>
                </xsl:for-each>
              </td>
            </xsl:if>
        </tr>
    </xsl:template>
    <xsl:template name="CHART">
        <xsl:if test="/CONS/@SEZSCR != '0'">
            <div class="container-fluid">
                <div class="row">
                    <div id="myChart" style="width:100%;height:800px;float:right;"></div>
                </div>
            </div>
            <script src="include/Chart.min.js"></script>
            <script src="include/options.js"></script>
            <script src="include/amcharts.js"></script>
            <script src="include/responsive.min.js"></script>
            <script src="include/pie.js"></script>
            <script>


                var elementi = [
                <xsl:for-each select="/CONS/SV/V0/V1">{
                    <xsl:variable name="numero">
                        <xsl:value-of select="@NUMERO"/>
                    </xsl:variable>
                    voti: +<xsl:value-of select="@VOTIVALIDI_C1"/>,
					nome: "<xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@NOME"/>",
                    perc: "<xsl:value-of select="format-number(@VOTIVALIDI_C1 div ../@TOT_VOTIVALIDI_C1,'#0.##%', 'perc')"/>",
                    sigla: "<xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@SIGLA"/>"
                    <xsl:if test="/CONS/C0/C1[@NUMERO=$numero]/@COLORE != ''" >
                      , color: "<xsl:value-of select="/CONS/C0/C1[@NUMERO=$numero]/@COLORE"/>"
                    </xsl:if>
                    }
                    <xsl:if test="position() != last()" >,</xsl:if>
                </xsl:for-each>
                ];


                window.onload = function (){
                var chart = AmCharts.makeChart("myChart", {
                "type": "pie",
				"thousandsSeparator": "",
                "percentPrecision": 2,
                "precision": 0,
                "pullOutOnlyOne": true,
                "dataProvider": elementi,
                "titleField": "nome",
                "valueField": "voti",
                "colorField": "color",
                "labelRadius": 5,
                "radius": "40%",
                "innerRadius": "50%",
                "labelText": "[[nome]]",
                "responsive": {
                "enabled": false
                },
                "legend": {
                "valueText": "[[perc]]",
                "enabled": true,
                "align": "center",
                "markerType": "circle"
                },
                });
                };
            </script>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
